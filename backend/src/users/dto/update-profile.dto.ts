import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  grade_id: z.string().uuid().optional().nullable(),
  board_id: z.string().uuid().optional().nullable(),
  country_id: z.string().uuid().optional().nullable(),
  is_onboarded: z.boolean().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
