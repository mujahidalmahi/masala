import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Profile not found');
    return data;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { error } = await this.supabase
      .from('profiles')
      .update(dto)
      .eq('id', userId);

    if (error) throw new NotFoundException('Profile not found');
    return this.getProfile(userId);
  }

  async getDashboard(userId: string) {
    const [profile, todayLog, streak, weakAreas] = await Promise.all([
      this.getProfile(userId),
      this.supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', new Date().toISOString().split('T')[0])
        .maybeSingle(),
      this.supabase
        .from('streak_records')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      this.supabase
        .rpc('get_weak_topics', { p_user_id: userId, p_limit: 5 }),
    ]);

    const { data: recentSessions } = await this.supabase
      .from('study_sessions')
      .select('*, subjects(name), chapters(name), topics(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: nextLevel } = await this.supabase
      .rpc('get_next_level_info', { p_user_id: userId });

    return {
      profile,
      today: todayLog?.data || null,
      streak: streak?.data || null,
      weak_areas: weakAreas.data || [],
      recent_sessions: recentSessions || [],
      next_level: nextLevel || null,
    };
  }

  async completeOnboarding(
    userId: string,
    data: { country_id: string; board_id: string; grade_id: string; subject_ids: string[] },
  ) {
    if (!data.country_id || !data.board_id || !data.grade_id) {
      throw new BadRequestException('country_id, board_id, and grade_id are required');
    }

    const { error: profileError } = await this.supabase
      .from('profiles')
      .update({
        country_id: data.country_id,
        board_id: data.board_id,
        grade_id: data.grade_id,
        is_onboarded: true,
      })
      .eq('id', userId);

    if (profileError) throw new NotFoundException('Failed to update profile');

    if (data.subject_ids?.length > 0) {
      const gradeSubjects = data.subject_ids.map((subjectId) => ({
        grade_id: data.grade_id,
        subject_id: subjectId,
      }));
      const { error: gsError } = await this.supabase
        .from('grade_subjects')
        .upsert(gradeSubjects, { onConflict: 'grade_id,subject_id' });
      if (gsError) {
        // Non-critical - subjects already exist
      }
    }

    return { message: 'Onboarding completed', is_onboarded: true };
  }
}
