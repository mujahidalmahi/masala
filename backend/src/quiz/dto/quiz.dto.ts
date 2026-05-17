import { z } from 'zod';

export const CreateQuizSchema = z.object({
  subject_id: z.string().uuid(),
  chapter_id: z.string().uuid().optional().nullable(),
  topic_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().max(500).optional().nullable(),
  quiz_type: z.enum(['practice', 'mock', 'revision', 'topic_wise', 'chapter_wise', 'board_style', 'daily_quiz']),
  difficulty: z.number().int().min(1).max(5).optional().nullable(),
  time_limit_minutes: z.number().int().positive().optional().nullable(),
  question_ids: z.array(z.string().uuid()).min(1).optional(),
});

export const AutoGenerateQuizSchema = z.object({
  subject_id: z.string().uuid().optional(),
  chapter_id: z.string().uuid().optional().nullable(),
  topic_id: z.string().uuid().optional().nullable(),
  question_count: z.number().int().min(1).max(50).default(10),
  quiz_type: z.string(),
  difficulty: z.string().optional(),
}).refine((d) => d.topic_id || d.chapter_id, {
  message: 'Either topic_id or chapter_id is required',
});

export const SubmitAnswerSchema = z.object({
  question_id: z.string().uuid(),
  selected_option_id: z.string().uuid().optional().nullable(),
  text_answer: z.string().optional().nullable(),
});

export const StartAttemptSchema = z.object({
  quiz_id: z.string().uuid(),
});

export type CreateQuizDto = z.infer<typeof CreateQuizSchema>;
export type AutoGenerateQuizDto = z.infer<typeof AutoGenerateQuizSchema>;
export type SubmitAnswerDto = z.infer<typeof SubmitAnswerSchema>;
export type StartAttemptDto = z.infer<typeof StartAttemptSchema>;
