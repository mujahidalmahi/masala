import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CurriculumService {
  constructor(private supabase: SupabaseService) {}

  async getCountries() {
    const { data } = await this.supabase.from('countries').select('*').order('name');
    return data || [];
  }

  async getBoards(countryId?: string) {
    let query = this.supabase.from('boards').select('*, countries(name)');
    if (countryId) query = query.eq('country_id', countryId);
    const { data } = await query.order('name');
    return data || [];
  }

  async getGrades(boardId?: string) {
    let query = this.supabase.from('grades').select('*, boards(name)');
    if (boardId) query = query.eq('board_id', boardId);
    const { data } = await query.order('display_order');
    return data || [];
  }

  async getSubjects(gradeId?: string) {
    if (gradeId) {
      const { data } = await this.supabase
        .from('grade_subjects')
        .select('subjects(*)')
        .eq('grade_id', gradeId);
      return (data || []).map((gs: any) => gs.subjects).filter(Boolean);
    }
    const { data } = await this.supabase.from('subjects').select('*').order('name');
    return data || [];
  }

  async getChapters(subjectId: string, gradeId?: string) {
    let query = this.supabase
      .from('chapters')
      .select('*, subjects(name)')
      .eq('subject_id', subjectId);
    if (gradeId) query = query.eq('grade_id', gradeId);
    const { data } = await query.order('display_order');
    return data || [];
  }

  async getTopics(chapterId: string) {
    const { data } = await this.supabase
      .from('topics')
      .select('*, chapters(name)')
      .eq('chapter_id', chapterId)
      .order('display_order');
    return data || [];
  }

  async getLearningOutcomes(topicId: string) {
    const { data } = await this.supabase
      .from('learning_outcomes')
      .select('*')
      .eq('topic_id', topicId)
      .order('display_order');
    return data || [];
  }

  async getFullSubjectTree(subjectId: string, gradeId: string) {
    const chapters = await this.getChapters(subjectId, gradeId);
    const chapterIds = chapters.map((c: any) => c.id);

    const { data: topics } = await this.supabase
      .from('topics')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('display_order');

    return (chapters as any[]).map((chapter) => ({
      ...chapter,
      topics: (topics || []).filter((t: any) => t.chapter_id === chapter.id),
    }));
  }
}
