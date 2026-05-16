import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PredictionService {
  constructor(private supabase: SupabaseService) {}

  async getPerformancePrediction(userId: string, subjectId?: string) {
    const { data, error } = await this.supabase.rpc('generate_performance_prediction', {
      p_user_id: userId,
      p_subject_id: subjectId || null,
    });

    if (error) throw new Error('Failed to generate prediction');
    return data;
  }

  async getPredictions(userId: string, type?: string) {
    let query = this.supabase
      .from('prediction_results')
      .select('*, subjects(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('prediction_type', type);
    const { data } = await query.limit(20);
    return data || [];
  }

  async getMasterySnapshots(userId: string, topicId?: string) {
    let query = this.supabase
      .from('mastery_snapshots')
      .select('*, subjects(name), topics(name)')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false });

    if (topicId) query = query.eq('topic_id', topicId);
    const { data } = await query.limit(50);
    return data || [];
  }

  async getWeakAreas(userId: string) {
    const { data } = await this.supabase
      .from('weak_areas')
      .select('*, subjects(name), topics(name, chapters(name))')
      .eq('user_id', userId)
      .eq('is_resolved', false)
      .order('weakness_score', { ascending: false });

    return data || [];
  }

  async getExamReadiness(userId: string, subjectId: string) {
    const [mastery, weakAreas, prediction] = await Promise.all([
      this.supabase
        .from('mastery_snapshots')
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      this.supabase
        .from('weak_areas')
        .select('*, topics(name)')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .eq('is_resolved', false),
      this.getPerformancePrediction(userId, subjectId),
    ]);

    return {
      readiness_score: prediction?.predicted_score || 0,
      weak_topics_count: (weakAreas.data || []).length,
      weak_topics: weakAreas.data || [],
      last_mastery: mastery.data || null,
      prediction,
    };
  }
}
