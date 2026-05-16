import { z } from 'zod';

export const CreateSessionSchema = z.object({
  subject_id: z.string().uuid('Invalid subject ID').optional().nullable(),
  chapter_id: z.string().uuid().optional().nullable(),
  topic_id: z.string().uuid().optional().nullable(),
  duration_minutes: z.number().int().min(1, 'Duration must be at least 1 minute'),
  session_type: z.enum(['focus', 'revision', 'practice', 'quiz', 'reading']),
  notes: z.string().max(2000).optional().nullable(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional().nullable(),
});

export const EndSessionSchema = z.object({
  ended_at: z.string().datetime(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type EndSessionDto = z.infer<typeof EndSessionSchema>;
