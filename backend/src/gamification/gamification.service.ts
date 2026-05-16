import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class GamificationService {
  constructor(private supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('xp_total, level_id, current_streak, longest_streak, last_study_date')
      .eq('id', userId)
      .single();

    const { data: nextLevel } = await this.supabase.rpc('get_next_level_info', {
      p_user_id: userId,
    });

    const { data: recentXp } = await this.supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      xp_total: profile?.xp_total || 0,
      level_id: profile?.level_id || 1,
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      last_study_date: profile?.last_study_date || null,
      next_level: nextLevel || null,
      recent_xp: recentXp || [],
    };
  }

  async getStreak(userId: string) {
    const { data } = await this.supabase
      .from('streak_records')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return data || { current_streak: 0, longest_streak: 0, max_streak: 0, total_active_days: 0 };
  }

  async getBadges(userId: string) {
    const { data } = await this.supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);

    return data || [];
  }

  async getAllBadges() {
    const { data } = await this.supabase
      .from('badges')
      .select('*')
      .order('name');

    return data || [];
  }

  async getSkills(userId: string) {
    const { data } = await this.supabase
      .from('user_skills')
      .select('*, skill_trees(name, icon, subjects(name)), chapters(name)')
      .eq('user_id', userId)
      .order('mastery_level', { ascending: false });

    return data || [];
  }

  async getSkillTrees(subjectId?: string) {
    let query = this.supabase
      .from('skill_trees')
      .select('*, subjects(name)');

    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data } = await query.order('name');
    return data || [];
  }

  async getLeaderboard(type: 'xp' | 'streak' = 'xp', limit = 20, offset = 0) {
    const { data } = await this.supabase.rpc('get_leaderboard', {
      p_limit: limit,
      p_offset: offset,
      p_sort_by: type,
    });

    return data || [];
  }

  async getUserRank(userId: string) {
    const { data } = await this.supabase.rpc('get_user_rank', {
      p_user_id: userId,
    });
    return data || { rank: 0, total_users: 0, percentile: 0 };
  }

  async getDailyChallenges(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: challenges } = await this.supabase
      .from('daily_challenges')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', today)
      .gte('valid_to', today);

    const { data: userProgress } = await this.supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId);

    const progressMap = new Map<string, any>((userProgress || []).map((uc: any) => [uc.challenge_id, uc]));

    return (challenges || []).map((challenge: any) => ({
      ...challenge,
      progress: progressMap.get(challenge.id)?.progress || 0,
      is_completed: progressMap.get(challenge.id)?.is_completed || false,
    }));
  }

  async getLevels() {
    const { data } = await this.supabase
      .from('levels')
      .select('*')
      .order('id');

    return data || [];
  }
}
