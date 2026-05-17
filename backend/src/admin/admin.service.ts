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
    const today = new Date().toISOString().split('T')[0];
    const [users, subjects, questions, badges, sessions, quizzes, activeUsers, recentSessions] = await Promise.all([
      this.supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'admin'),
      this.supabase.from('subjects').select('id', { count: 'exact', head: true }),
      this.supabase.from('questions').select('id', { count: 'exact', head: true }),
      this.supabase.from('badges').select('id', { count: 'exact', head: true }),
      this.supabase.from('study_sessions').select('id', { count: 'exact', head: true }),
      this.supabase.from('quizzes').select('id', { count: 'exact', head: true }),
      this.supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_study_date', today).neq('role', 'admin'),
      this.supabase.from('study_sessions').select('id, created_at, session_type, profiles(display_name, username)').order('created_at', { ascending: false }).limit(5),
    ]);
    return {
      total_users: users.count || 0,
      active_today: activeUsers.count || 0,
      total_subjects: subjects.count || 0,
      total_quizzes: quizzes.count || 0,
      total_questions: questions.count || 0,
      total_badges: badges.count || 0,
      total_sessions: sessions.count || 0,
      recent_activity: (recentSessions.data || []).map((s: any) => ({
        id: s.id,
        message: `${s.profiles?.display_name || s.profiles?.username || 'A user'} started a ${s.session_type} session`,
        created_at: s.created_at,
      })),
    };
  }

  async getUsers(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .neq('role', 'admin');

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

  async createSubject(data: { name: string; description?: string; icon?: string; color?: string; grade_id?: string }) {
    const { grade_id, ...subjectData } = data;
    const { data: subject, error } = await this.supabase
      .from('subjects')
      .insert(subjectData)
      .select()
      .single();
    if (error) throw new NotFoundException('Failed to create subject');

    if (grade_id) {
      const { error: gsError } = await this.supabase
        .from('grade_subjects')
        .insert({ grade_id, subject_id: subject.id });
      if (gsError) throw new NotFoundException('Failed to link grade');
    }

    return subject;
  }

  async updateSubject(id: string, data: any) {
    const { grade_id, ...subjectData } = data;
    const { data: subject, error } = await this.supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException('Subject not found');

    if (grade_id) {
      await this.supabase
        .from('grade_subjects')
        .delete()
        .eq('subject_id', id);
      const { error: gsError } = await this.supabase
        .from('grade_subjects')
        .insert({ grade_id, subject_id: id });
      if (gsError) throw new NotFoundException('Failed to update grade link');
    }

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

  async toggleRoom(roomId: string) {
    const { data: room } = await this.supabase
      .from('focus_rooms')
      .select('is_active')
      .eq('id', roomId)
      .single();
    if (!room) throw new NotFoundException('Room not found');
    const { error } = await this.supabase
      .from('focus_rooms')
      .update({ is_active: !room.is_active })
      .eq('id', roomId);
    if (error) throw new NotFoundException('Failed to toggle room');
    return { is_active: !room.is_active };
  }

}
