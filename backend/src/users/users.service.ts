import { Injectable, NotFoundException } from '@nestjs/common';
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
}
