import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const HOURS_ROUNDING_FACTOR = 10;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private supabase: SupabaseService) {}

  async generateWeeklyReport(userId: string) {
    const endDate = new Date();
    const startDate = new Date(Date.now() - 7 * 86400000);

    const [profile, sessions, dailyLogs, quizzes, streak] = await Promise.all([
      this.supabase.from('profiles').select('*').eq('id', userId).single(),
      this.supabase
        .from('study_sessions')
        .select('*, subjects(name), chapters(name), topics(name)')
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at'),
      this.supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate.toISOString().split('T')[0])
        .lte('log_date', endDate.toISOString().split('T')[0])
        .order('log_date'),
      this.supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, quiz_type)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at'),
      this.supabase.from('streak_records').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      profile: profile.data,
      sessions: sessions.data || [],
      daily_logs: dailyLogs.data || [],
      quizzes: quizzes.data || [],
      streak: streak.data || null,
      summary: this.buildSummary(sessions.data || [], dailyLogs.data || []),
    };
  }

  async generateMonthlyReport(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const data = await this.getRangeData(userId, startDate, endDate);
    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      ...data,
      summary: this.buildSummary(data.sessions || [], data.daily_logs || []),
    };
  }

  async generateCustomReport(userId: string, startDate: string, endDate: string) {
    const data = await this.getRangeData(userId, new Date(startDate), new Date(endDate));
    return {
      period: { start: startDate, end: endDate },
      ...data,
      summary: this.buildSummary(data.sessions || [], data.daily_logs || []),
    };
  }

  private async getRangeData(userId: string, startDate: Date, endDate: Date) {
    const [profile, sessions, dailyLogs, quizzes, streak, mastery] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('id, username, display_name, xp_total, level_id, current_streak, longest_streak')
        .eq('id', userId)
        .single(),
      this.supabase
        .from('study_sessions')
        .select('*, subjects(name), chapters(name), topics(name)')
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at'),
      this.supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate.toISOString().split('T')[0])
        .lte('log_date', endDate.toISOString().split('T')[0])
        .order('log_date'),
      this.supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, quiz_type)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at'),
      this.supabase.from('streak_records').select('*').eq('user_id', userId).maybeSingle(),
      this.supabase
        .from('mastery_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: false }),
    ]);

    return {
      profile: profile.data,
      sessions: sessions.data || [],
      daily_logs: dailyLogs.data || [],
      quizzes: quizzes.data || [],
      streak: streak.data || null,
      mastery: mastery?.data || [],
    };
  }

  private buildSummary(sessions: any[], dailyLogs: any[]) {
    const totalMinutes = sessions.reduce(
      (sum: number, s: any) => sum + (s.duration_minutes || 0),
      0,
    );
    const totalSessions = sessions.length;
    const subjectsMap = new Map<string, { name: string; minutes: number; sessions: number }>();

    sessions.forEach((s: any) => {
      const subId = s.subject_id;
      if (!subjectsMap.has(subId)) {
        subjectsMap.set(subId, { name: s.subjects?.name || 'Unknown', minutes: 0, sessions: 0 });
      }
      const entry = subjectsMap.get(subId)!;
      entry.minutes += s.duration_minutes || 0;
      entry.sessions += 1;
    });

    const activeDays = dailyLogs.length;
    const avgDailyMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

    return {
      total_minutes: totalMinutes,
      total_hours: Math.round((totalMinutes / 60) * HOURS_ROUNDING_FACTOR) / HOURS_ROUNDING_FACTOR,
      total_sessions: totalSessions,
      active_days: activeDays,
      avg_daily_minutes: avgDailyMinutes,
      subjects: Array.from(subjectsMap.values()),
    };
  }

  async getReportHistory(userId: string) {
    const { data } = await this.supabase
      .from('report_history')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });
    return data || [];
  }

  async saveReport(userId: string, reportType: string, reportData: any) {
    const { data, error } = await this.supabase
      .from('report_history')
      .insert({
        user_id: userId,
        report_type: reportType,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        report_data: reportData,
        date_range_start: reportData.period?.start || new Date().toISOString().split('T')[0],
        date_range_end: reportData.period?.end || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw new NotFoundException('Failed to save report');
    return data;
  }
}
