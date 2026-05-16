import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StudySessionInput {
  subject_id: string;
  chapter_id?: string;
  topic_id?: string;
  duration_minutes: number;
  session_type: 'focus' | 'revision' | 'practice' | 'quiz' | 'reading';
  notes?: string;
  started_at: string;
  ended_at?: string;
}
