import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  room_type: z.enum([
    'exam_prep',
    'silent_focus',
    'night_study',
    'subject_specific',
    'group_study',
    'pomodoro',
  ]),
  subject_id: z.string().uuid().optional().nullable(),
  is_private: z.boolean().optional().default(false),
  max_participants: z.number().int().min(2).max(200).optional().default(50),
});

export const JoinRoomSchema = z.object({
  room_id: z.string().uuid(),
  access_code: z.string().optional().nullable(),
});

export type CreateRoomDto = z.infer<typeof CreateRoomSchema>;
export type JoinRoomDto = z.infer<typeof JoinRoomSchema>;
