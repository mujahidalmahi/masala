import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';

import {
  CreateQuizDto,
  AutoGenerateQuizDto,
  SubmitAnswerDto,
  StartAttemptDto,
} from './dto/quiz.dto';

import { IBMBoBService } from './ibm-bob.service';

@Injectable()
export class QuizService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly ibmBob: IBMBoBService,
  ) { }

  async createQuiz(
    userId: string,
    dto: CreateQuizDto,
  ) {
    const { data: quiz, error } =
      await this.supabase
        .from('quizzes')
        .insert({
          user_id: userId,
          subject_id: dto.subject_id,
          chapter_id:
            dto.chapter_id || null,
          topic_id: dto.topic_id || null,
          title: dto.title,
          description:
            dto.description || null,
          quiz_type: dto.quiz_type,
          difficulty:
            dto.difficulty || null,
          time_limit_minutes:
            dto.time_limit_minutes ||
            null,
          total_questions:
            dto.question_ids?.length || 0,
          is_generated: false,
        })
        .select()
        .single();

    if (error) {
      throw new BadRequestException(
        'Failed to create quiz',
      );
    }

    if (dto.question_ids?.length) {
      const questions =
        dto.question_ids.map(
          (qId: string, i: number) => ({
            quiz_id: quiz.id,
            question_id: qId,
            display_order: i + 1,
          }),
        );

      await this.supabase
        .from('quiz_questions')
        .insert(questions);
    }

    return quiz;
  }

  async generateQuizWithAI(
    userId: string,
    dto: AutoGenerateQuizDto,
  ) {
    const { data: topic, error } =
      await this.supabase
        .from('topics')
        .select(`
          id,
          name
        `)
        .eq('id', dto.topic_id)
        .single();

    if (error || !topic) {
      throw new NotFoundException(
        'Topic not found',
      );
    }

    const aiQuestions =
      await this.ibmBob.generateQuizQuestions(
        {
          topic: topic.name,
          difficulty:
            dto.difficulty || 'medium',
          questionCount:
            dto.question_count,
          questionType: dto.quiz_type,
        },
      );

    const { data: quiz, error: quizError } =
      await this.supabase
        .from('quizzes')
        .insert({
          user_id: userId,
          topic_id: dto.topic_id,
          title: `AI Generated: ${topic.name}`,
          quiz_type: dto.quiz_type,
          difficulty:
            this.getDifficultyLevel(
              dto.difficulty || 'medium',
            ),
          total_questions:
            aiQuestions.length,
          is_generated: true,
        })
        .select()
        .single();

    if (quizError || !quiz) {
      throw new BadRequestException(
        'Failed to create AI quiz',
      );
    }

    for (
      let i = 0;
      i < aiQuestions.length;
      i++
    ) {
      const q = aiQuestions[i];

      const { data: question } =
        await this.supabase
          .from('questions')
          .insert({
            question_text:
              q.question_text,
            question_type:
              q.question_type,
            difficulty: q.difficulty,
            explanation:
              q.explanation,
            topic_id: dto.topic_id,
          })
          .select()
          .single();

      if (!question) continue;

      await this.supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question_id: question.id,
          display_order: i + 1,
        });

      if (q.options?.length) {
        const options = q.options.map(
          (
            opt: any,
            idx: number,
          ) => ({
            question_id: question.id,
            option_text:
              opt.option_text,
            is_correct:
              opt.is_correct,
            display_order: idx + 1,
          }),
        );

        await this.supabase
          .from('question_options')
          .insert(options);
      }
    }

    return this.getQuiz(quiz.id);
  }

  async getQuiz(quizId: string) {
    const { data: quiz, error } =
      await this.supabase
        .from('quizzes')
        .select(
          '*, subjects(name), chapters(name), topics(name)',
        )
        .eq('id', quizId)
        .single();

    if (error || !quiz) {
      throw new NotFoundException(
        'Quiz not found',
      );
    }

    return quiz;
  }

  async getQuizzes(
    userId: string,
    subjectId?: string,
  ) {
    let query = this.supabase
      .from('quizzes')
      .select('*')
      .or(
        `user_id.eq.${userId},is_public.eq.true`,
      );

    if (subjectId) {
      query = query.eq(
        'subject_id',
        subjectId,
      );
    }

    const { data } = await query.order(
      'created_at',
      {
        ascending: false,
      },
    );

    return data || [];
  }

  async startAttempt(
    userId: string,
    dto: StartAttemptDto,
  ) {
    const { data: attempt, error } =
      await this.supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: dto.quiz_id,
          status: 'in_progress',
        })
        .select()
        .single();

    if (error) {
      throw new BadRequestException(
        'Failed to start attempt',
      );
    }

    return attempt;
  }

  async submitAnswer(
    userId: string,
    attemptId: string,
    dto: SubmitAnswerDto,
  ) {
    const { data, error } =
      await this.supabase
        .from('user_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: dto.question_id,
          selected_option_id:
            dto.selected_option_id ||
            null,
          text_answer:
            dto.text_answer || null,
        })
        .select()
        .single();

    if (error) {
      throw new BadRequestException(
        'Failed to submit answer',
      );
    }

    return data;
  }

  async submitAttempt(
    userId: string,
    attemptId: string,
  ) {
    return {
      success: true,
      attemptId,
      userId,
    };
  }

  async getAttemptHistory(
    userId: string,
  ) {
    const { data } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      });

    return data || [];
  }

  async getAttempt(
    attemptId: string,
    userId: string,
  ) {
    const { data } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (!data) {
      throw new NotFoundException(
        'Attempt not found',
      );
    }

    return data;
  }

  private getDifficultyLevel(
    difficulty: string,
  ): number {
    const levels: Record<
      string,
      number
    > = {
      easy: 1,
      medium: 3,
      hard: 5,
    };

    return (
      levels[
      difficulty?.toLowerCase()
      ] || 3
    );
  }
}