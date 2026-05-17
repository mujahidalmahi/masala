import { z } from 'zod';

/* ---------------- CREATE QUIZ ---------------- */

export const CreateQuizSchema = z.object({
  subject_id: z.string().uuid(),

  chapter_id: z.string().uuid().optional(),

  topic_id: z.string().uuid().optional(),

  title: z.string().min(3),

  description: z.string().optional(),

  quiz_type: z.string(),

  difficulty: z.number().optional(),

  time_limit_minutes: z.number().optional(),

  question_ids: z.array(z.string().uuid()).optional(),
});

export type CreateQuizDto = z.infer<
  typeof CreateQuizSchema
>;

/* ---------------- AI GENERATE QUIZ ---------------- */

export const AutoGenerateQuizSchema =
  z.object({
    topic_id: z.string().uuid(),

    question_count: z.number().min(1).max(50),

    quiz_type: z.string(),

    difficulty: z.string().optional(),
  });

export type AutoGenerateQuizDto =
  z.infer<
    typeof AutoGenerateQuizSchema
  >;

/* ---------------- START ATTEMPT ---------------- */

export const StartAttemptSchema =
  z.object({
    quiz_id: z.string().uuid(),
  });

export type StartAttemptDto = z.infer<
  typeof StartAttemptSchema
>;

/* ---------------- SUBMIT ANSWER ---------------- */

export const SubmitAnswerSchema =
  z.object({
    question_id: z.string().uuid(),

    selected_option_id: z
      .string()
      .uuid()
      .optional(),

    text_answer: z.string().optional(),
  });

export type SubmitAnswerDto = z.infer<
  typeof SubmitAnswerSchema
>;