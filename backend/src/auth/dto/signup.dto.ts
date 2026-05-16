import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  display_name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  grade_id: z.string().uuid().optional(),
  board_id: z.string().uuid().optional(),
  country_id: z.string().uuid().optional(),
});

export type SignupDto = z.infer<typeof SignupSchema>;
