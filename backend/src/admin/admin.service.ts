import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  private async requireAdmin(userId: string) {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!profile || profile.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getStats(userId: string) {
    await this.requireAdmin(userId);
    const [users, subjects, questions, badges, sessions] = await Promise.all([
      this.supabase.from('profiles').select('id', { count: 'exact', head: true }),
      this.supabase.from('subjects').select('id', { count: 'exact', head: true }),
      this.supabase.from('questions').select('id', { count: 'exact', head: true }),
      this.supabase.from('badges').select('id', { count: 'exact', head: true }),
      this.supabase.from('study_sessions').select('id', { count: 'exact', head: true }),
    ]);
    return {
      total_users: users.count || 0,
      total_subjects: subjects.count || 0,
      total_questions: questions.count || 0,
      total_badges: badges.count || 0,
      total_sessions: sessions.count || 0,
    };
  }

  async getUsers(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new NotFoundException('Failed to fetch users');
    return { data, total: count || 0, page, limit };
  }

  async getUser(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException('User not found');
    return data;
  }

  async updateUser(id: string, data: any) {
    const { error } = await this.supabase
      .from('profiles')
      .update(data)
      .eq('id', id);
    if (error) throw new NotFoundException('Failed to update user');
    return this.getUser(id);
  }

  async deleteUser(id: string) {
    const { error: profileError } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (profileError) throw new NotFoundException('Failed to delete user');
    const { error: authError } = await this.supabase.auth.admin.deleteUser(id);
    if (authError) throw new NotFoundException('Failed to delete auth user');
    return { message: 'User deleted successfully' };
  }

  async createSubject(data: { name: string; description?: string; icon?: string; color?: string }) {
    const { data: subject, error } = await this.supabase
      .from('subjects')
      .insert(data)
      .select()
      .single();
    if (error) throw new NotFoundException('Failed to create subject');
    return subject;
  }

  async updateSubject(id: string, data: any) {
    const { data: subject, error } = await this.supabase
      .from('subjects')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException('Subject not found');
    return subject;
  }

  async deleteSubject(id: string) {
    const { error } = await this.supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    if (error) throw new NotFoundException('Failed to delete subject');
    return { message: 'Subject deleted successfully' };
  }

  async createChapter(data: { subject_id: string; grade_id: string; name: string; display_order?: number; description?: string }) {
    const { data: chapter, error } = await this.supabase
      .from('chapters')
      .insert(data)
      .select()
      .single();
    if (error) throw new NotFoundException('Failed to create chapter');
    return chapter;
  }

  async updateChapter(id: string, data: any) {
    const { data: chapter, error } = await this.supabase
      .from('chapters')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException('Chapter not found');
    return chapter;
  }

  async createTopic(data: { chapter_id: string; name: string; display_order?: number; content_summary?: string; learning_outcomes?: string[] }) {
    const { data: topic, error } = await this.supabase
      .from('topics')
      .insert(data)
      .select()
      .single();
    if (error) throw new NotFoundException('Failed to create topic');
    return topic;
  }

  async updateTopic(id: string, data: any) {
    const { data: topic, error } = await this.supabase
      .from('topics')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException('Topic not found');
    return topic;
  }

  async getQuestions(params: { page: number; limit: number; subject_id?: string }) {
    const { page, limit, subject_id } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('questions')
      .select('*, topics(name, chapters(name, subject_id))', { count: 'exact' });

    if (subject_id) {
      query = query.eq('topics.chapters.subject_id', subject_id);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new NotFoundException('Failed to fetch questions');
    return { data, total: count || 0, page, limit };
  }

  async createQuestion(data: any) {
    const { options, ...questionData } = data;
    const { data: question, error } = await this.supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single();
    if (error) throw new NotFoundException('Failed to create question');

    if (options && options.length > 0) {
      const { error: optError } = await this.supabase
        .from('question_options')
        .insert(options.map((o: any) => ({ ...o, question_id: question.id })));
      if (optError) throw new NotFoundException('Failed to create options');
    }
    return question;
  }

  async updateQuestion(id: string, data: any) {
    const { options, ...questionData } = data;
    const { data: question, error } = await this.supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException('Question not found');

    if (options) {
      await this.supabase.from('question_options').delete().eq('question_id', id);
      if (options.length > 0) {
        const { error: optError } = await this.supabase
          .from('question_options')
          .insert(options.map((o: any) => ({ ...o, question_id: id })));
        if (optError) throw new NotFoundException('Failed to update options');
      }
    }
    return question;
  }

  async deleteQuestion(id: string) {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) throw new NotFoundException('Failed to delete question');
    return { message: 'Question deleted successfully' };
  }

  async createBadge(data: { name: string; description: string; icon_url?: string; badge_type: string; rarity: string; xp_reward?: number }) {
    const { data: badge, error } = await this.supabase
      .from('badges')
      .insert(data)
      .select()
      .single();
    if (error) throw new NotFoundException('Failed to create badge');
    return badge;
  }

  async updateBadge(id: string, data: any) {
    const { data: badge, error } = await this.supabase
      .from('badges')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException('Badge not found');
    return badge;
  }

  async deleteBadge(id: string) {
    const { error } = await this.supabase
      .from('badges')
      .delete()
      .eq('id', id);
    if (error) throw new NotFoundException('Failed to delete badge');
    return { message: 'Badge deleted successfully' };
  }
}
