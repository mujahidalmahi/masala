import { z } from 'zod';

export const UploadTextbookSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  author: z.string().max(255).optional().nullable(),
  subject_id: z.string().uuid().optional().nullable(),
  file_type: z.enum(['pdf', 'image', 'doc', 'txt', 'epub']).optional(),
});

export const UploadFileSchema = z.object({
  subject_id: z.string().uuid().optional().nullable(),
  chapter_id: z.string().uuid().optional().nullable(),
  topic_id: z.string().uuid().optional().nullable(),
  file_category: z
    .enum(['note', 'screenshot', 'handwritten', 'worksheet', 'reference', 'other'])
    .optional()
    .default('note'),
});

export type UploadTextbookDto = z.infer<typeof UploadTextbookSchema>;
export type UploadFileDto = z.infer<typeof UploadFileSchema>;
