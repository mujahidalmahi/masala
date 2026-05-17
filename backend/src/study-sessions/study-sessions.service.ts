import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSessionDto, EndSessionDto } from './dto/create-session.dto';

@Injectable()
export class StudySessionsService {
  constructor(private supabase: SupabaseService) {}

  async create(userId: string, dto: CreateSessionDto) {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        subject_id: dto.subject_id,
        chapter_id: dto.chapter_id || null,
        topic_id: dto.topic_id || null,
        duration_minutes: dto.duration_minutes,
        session_type: dto.session_type,
        notes: dto.notes || null,
        started_at: dto.started_at || new Date().toISOString(),
        ended_at: dto.ended_at || null,
      })
      .select()
      .single();

    if (error) throw new NotFoundException('Failed to create session');
    return data;
  }

  async endSession(userId: string, sessionId: string, dto: EndSessionDto) {
    const { data: session } = await this.supabase
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!session) throw new NotFoundException('Session not found');
    if (session.ended_at) throw new NotFoundException('Session already ended');

    const endedMs = new Date(dto.ended_at).getTime();
    const startedMs = new Date(session.started_at).getTime();
    const actualMinutes = Math.max(1, Math.round((endedMs - startedMs) / 60000));

    const { data, error } = await this.supabase
      .from('study_sessions')
      .update({
        ended_at: dto.ended_at,
        notes: dto.notes || session.notes,
        duration_minutes: actualMinutes,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to end session: ${error.message}`);

    // XP, streak, and daily logs are handled by the process_study_session_end trigger
    return { session: data };
  }

  async getHistory(userId: string, limit = 20, offset = 0) {
    const { data, error, count } = await this.supabase
      .from('study_sessions')
      .select('*, subjects(name), chapters(name), topics(name)', { count: 'exact' })
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new NotFoundException('Failed to fetch sessions');
    return { data: data || [], meta: { total: count || 0, limit, offset } };
  }

  async getStats(userId: string) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const yearAgo = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

    const agg = async (start: string, end: string) => {
      const { data } = await this.supabase
        .from('study_sessions')
        .select('duration_minutes, xp_earned')
        .eq('user_id', userId)
        .gte('started_at', start)
        .lte('started_at', end);
      const rows = data || [];
      return {
        total_minutes: rows.reduce((s, r) => s + (r.duration_minutes || 0), 0),
        session_count: rows.length,
        total_xp: rows.reduce((s, r) => s + (r.xp_earned || 0), 0),
      };
    };

    const [todayRes, weekRes, monthRes, yearRes, allRes] = await Promise.all([
      agg(today, today + 'T23:59:59.999Z'),
      agg(weekAgo, today + 'T23:59:59.999Z'),
      agg(monthAgo, today + 'T23:59:59.999Z'),
      agg(yearAgo, today + 'T23:59:59.999Z'),
      agg('1970-01-01', today + 'T23:59:59.999Z'),
    ]);

    return {
      today: todayRes,
      week: weekRes,
      month: monthRes,
      year: yearRes,
      all: allRes,
    };
  }
}
