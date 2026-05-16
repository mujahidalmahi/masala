import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateQuizDto, AutoGenerateQuizDto, SubmitAnswerDto, StartAttemptDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(private supabase: SupabaseService) {}

  async createQuiz(userId: string, dto: CreateQuizDto) {
    const { data: quiz, error } = await this.supabase
      .from('quizzes')
      .insert({
        user_id: userId,
        subject_id: dto.subject_id,
        chapter_id: dto.chapter_id || null,
        topic_id: dto.topic_id || null,
        title: dto.title,
        description: dto.description || null,
        quiz_type: dto.quiz_type,
        difficulty: dto.difficulty || null,
        time_limit_minutes: dto.time_limit_minutes || null,
        total_questions: dto.question_ids?.length || 0,
        is_generated: false,
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to create quiz');

    if (dto.question_ids?.length) {
      const questions = dto.question_ids!.map((qId: string, i: number) => ({
        quiz_id: quiz.id,
        question_id: qId,
        display_order: i + 1,
      }));

      await this.supabase.from('quiz_questions').insert(questions);
    }

    return quiz;
  }

  async autoGenerateQuiz(userId: string, dto: AutoGenerateQuizDto) {
    const { data: quizId } = await this.supabase.rpc('generate_topic_quiz', {
      p_user_id: userId,
      p_topic_id: dto.topic_id,
      p_question_count: dto.question_count,
      p_quiz_type: dto.quiz_type,
    });

    if (!quizId) throw new BadRequestException('Failed to generate quiz');

    return this.getQuiz(quizId as string);
  }

  async getQuiz(quizId: string) {
    const { data: quiz, error } = await this.supabase
      .from('quizzes')
      .select('*, subjects(name), chapters(name), topics(name)')
      .eq('id', quizId)
      .single();

    if (error || !quiz) throw new NotFoundException('Quiz not found');

    const { data: quizQuestions } = await this.supabase
      .from('quiz_questions')
      .select('display_order, points, questions(*)')
      .eq('quiz_id', quizId)
      .order('display_order');

    const questionIds = (quizQuestions || []).map((qq: any) => qq.questions.id);

    const { data: options } = await this.supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds);

    const optionsMap = new Map<string, any[]>();
    (options || []).forEach((opt: any) => {
      if (!optionsMap.has(opt.question_id)) optionsMap.set(opt.question_id, []);
      optionsMap.get(opt.question_id)!.push(opt);
    });

    return {
      ...quiz,
      questions: (quizQuestions || []).map((qq: any) => ({
        ...qq.questions,
        display_order: qq.display_order,
        points: qq.points,
        options: (optionsMap.get(qq.questions.id) || []).map((o: any) => ({
          id: o.id,
          option_text: o.option_text,
          display_order: o.display_order,
        })),
      })),
    };
  }

  async getQuizzes(userId: string, subjectId?: string) {
    let query = this.supabase
      .from('quizzes')
      .select('*, subjects(name), chapters(name), topics(name)')
      .or(`user_id.eq.${userId},is_public.eq.true`);

    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  }

  async startAttempt(userId: string, dto: StartAttemptDto) {
    const { data: quiz } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('id', dto.quiz_id)
      .single();

    if (!quiz) throw new NotFoundException('Quiz not found');

    const { data: existingAttempt } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', dto.quiz_id)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (existingAttempt) return existingAttempt;

    const { data: attempt, error } = await this.supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: dto.quiz_id,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to start attempt');
    return attempt;
  }

  async submitAnswer(userId: string, attemptId: string, dto: SubmitAnswerDto) {
    const { data: attempt } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .single();

    if (!attempt) throw new NotFoundException('Active attempt not found');

    const { data, error } = await this.supabase
      .from('user_answers')
      .upsert({
        attempt_id: attemptId,
        question_id: dto.question_id,
        selected_option_id: dto.selected_option_id || null,
        text_answer: dto.text_answer || null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to submit answer');
    return data;
  }

  async submitAttempt(userId: string, attemptId: string) {
    const { data: attempt } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== 'in_progress') throw new BadRequestException('Attempt already completed');

    const { data: result, error } = await this.supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: attemptId,
    });

    if (error) throw new BadRequestException('Failed to submit attempt');
    return result;
  }

  async getAttemptHistory(userId: string) {
    const { data } = await this.supabase
      .from('quiz_attempts')
      .select('*, quizzes(title, subject_id, subjects(name), quiz_type)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(50);

    return data || [];
  }

  async getAttempt(attemptId: string, userId: string) {
    const { data: attempt } = await this.supabase
      .from('quiz_attempts')
      .select('*, quizzes(*)')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (!attempt) throw new NotFoundException('Attempt not found');

    const { data: answers } = await this.supabase
      .from('user_answers')
      .select('*, questions(question_text, question_type, explanation), question_options(option_text, is_correct)')
      .eq('attempt_id', attemptId);

    return { ...attempt, answers: answers || [] };
  }
}
