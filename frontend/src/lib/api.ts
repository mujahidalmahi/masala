import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith('/api/auth/');
    if (err.response?.status === 401 && typeof window !== 'undefined' && !isAuthRoute) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ─── Auth ─────────────────────────────────────────
export const authApi = {
  signup: (data: { email: string; password: string; display_name?: string; username?: string }) =>
    api.post('/api/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
};

// ─── Users ────────────────────────────────────────
export const usersApi = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data: any) => api.patch('/api/users/me', data),
  getDashboard: () => api.get('/api/users/dashboard'),
  onboard: (data: { country_id: string; board_id: string; grade_id: string; subject_ids: string[] }) =>
    api.post('/api/users/onboarding', data),
};

// ─── Curriculum ───────────────────────────────────
export const curriculumApi = {
  getCountries: () => api.get('/api/curriculum/countries'),
  getBoards: (countryId?: string) => api.get('/api/curriculum/boards', { params: { country_id: countryId } }),
  getGrades: (boardId?: string) => api.get('/api/curriculum/grades', { params: { board_id: boardId } }),
  getSubjects: (gradeId?: string) => api.get('/api/curriculum/subjects', { params: { grade_id: gradeId } }),
  getChapters: (subjectId: string, gradeId?: string) =>
    api.get('/api/curriculum/chapters', { params: { subject_id: subjectId, grade_id: gradeId } }),
  getTopics: (chapterId: string) => api.get(`/api/curriculum/topics/${chapterId}`),
  getTree: (subjectId: string, gradeId: string) => api.get(`/api/curriculum/tree/${subjectId}/${gradeId}`),
};

// ─── Study Sessions ──────────────────────────────
export const sessionsApi = {
  create: (data: any) => api.post('/api/study-sessions', data),
  endSession: (id: string, data: any) => api.patch(`/api/study-sessions/${id}/end`, data),
  getHistory: (params?: { limit?: number; offset?: number }) =>
    api.get('/api/study-sessions', { params }),
  getStats: () => api.get('/api/study-sessions/stats'),
};

// ─── Quizzes ─────────────────────────────────────
export const quizzesApi = {
  create: (data: any) => api.post('/api/quizzes', data),
  generate: (data: any) => api.post('/api/quizzes/generate', data),
  getAll: (subjectId?: string) => api.get('/api/quizzes', { params: { subject_id: subjectId } }),
  getOne: (id: string) => api.get(`/api/quizzes/${id}`),
  startAttempt: (data: { quiz_id: string }) => api.post('/api/quizzes/attempts', data),
  submitAnswer: (attemptId: string, data: any) =>
    api.post(`/api/quizzes/attempts/${attemptId}/answer`, data),
  submitAttempt: (attemptId: string) => api.post(`/api/quizzes/attempts/${attemptId}/submit`),
  getAttempts: () => api.get('/api/quizzes/attempts'),
  getAttempt: (id: string) => api.get(`/api/quizzes/attempts/${id}`),
};

// ─── Gamification ────────────────────────────────
export const gamificationApi = {
  getProfile: () => api.get('/api/gamification/profile'),
  getStreak: () => api.get('/api/gamification/streak'),
  getBadges: () => api.get('/api/gamification/badges'),
  getAllBadges: () => api.get('/api/gamification/badges/all'),
  getSkills: () => api.get('/api/gamification/skills'),
  getSkillTrees: (subjectId?: string) =>
    api.get('/api/gamification/skill-trees', { params: { subject_id: subjectId } }),
  getLeaderboard: (params?: { type?: string; limit?: number; offset?: number }) =>
    api.get('/api/gamification/leaderboard', { params }),
  getUserRank: () => api.get('/api/gamification/leaderboard/rank'),
  getChallenges: () => api.get('/api/gamification/challenges'),
  getLevels: () => api.get('/api/gamification/levels'),
};

// ─── Rooms ────────────────────────────────────────
export const roomsApi = {
  create: (data: any) => api.post('/api/rooms', data),
  getActive: (type?: string) => api.get('/api/rooms', { params: { type } }),
  getOne: (id: string) => api.get(`/api/rooms/${id}`),
  join: (id: string) => api.post(`/api/rooms/${id}/join`),
  leave: (id: string) => api.post(`/api/rooms/${id}/leave`),
  getParticipants: (id: string) => api.get(`/api/rooms/${id}/participants`),
  getMessages: (id: string, limit?: number) =>
    api.get(`/api/rooms/${id}/messages`, { params: { limit } }),
};

// ─── Predictions ─────────────────────────────────
export const predictionsApi = {
  getPerformance: (subjectId?: string) =>
    api.get('/api/predictions/performance', { params: { subject_id: subjectId } }),
  getAll: (type?: string) => api.get('/api/predictions', { params: { type } }),
  getMastery: (topicId?: string) =>
    api.get('/api/predictions/mastery', { params: { topic_id: topicId } }),
  getWeakAreas: () => api.get('/api/predictions/weak-areas'),
  getExamReadiness: (subjectId: string) =>
    api.get(`/api/predictions/exam-readiness/${subjectId}`),
};

// ─── Reports ──────────────────────────────────────
export const reportsApi = {
  getWeekly: () => api.get('/api/reports/weekly'),
  getMonthly: () => api.get('/api/reports/monthly'),
  getCustom: (start: string, end: string) =>
    api.get('/api/reports/custom', { params: { start, end } }),
  getHistory: () => api.get('/api/reports/history'),
};

// ─── Routines ─────────────────────────────────────
export const routinesApi = {
  generate: (availableMinutes?: number) =>
    api.post('/api/routines/generate', { available_minutes: availableMinutes }),
  getToday: () => api.get('/api/routines/today'),
  markSlotComplete: (slotId: string) =>
    api.post(`/api/routines/slots/${slotId}/complete`),
  getHistory: (limit?: number) =>
    api.get('/api/routines/history', { params: { limit } }),
  getWeekly: () => api.get('/api/routines/weekly'),
};

// ─── Textbooks ────────────────────────────────────
export const textbooksApi = {
  upload: (data: FormData) =>
    api.post('/api/textbooks/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/api/textbooks'),
  delete: (id: string) => api.delete(`/api/textbooks/${id}`),
};

// ─── Files ────────────────────────────────────────
export const filesApi = {
  upload: (data: FormData) =>
    api.post('/api/files/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/api/files'),
  delete: (id: string) => api.delete(`/api/files/${id}`),
};

// ─── Admin ────────────────────────────────────────
export const adminApi = {
  // Users
  getUsers: (params?: any) => api.get('/api/admin/users', { params }),
  getUser: (id: string) => api.get(`/api/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/api/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),

  // Curriculum
  createSubject: (data: any) => api.post('/api/admin/curriculum/subjects', data),
  updateSubject: (id: string, data: any) => api.patch(`/api/admin/curriculum/subjects/${id}`, data),
  deleteSubject: (id: string) => api.delete(`/api/admin/curriculum/subjects/${id}`),
  createChapter: (data: any) => api.post('/api/admin/curriculum/chapters', data),
  updateChapter: (id: string, data: any) => api.patch(`/api/admin/curriculum/chapters/${id}`, data),
  createTopic: (data: any) => api.post('/api/admin/curriculum/topics', data),
  updateTopic: (id: string, data: any) => api.patch(`/api/admin/curriculum/topics/${id}`, data),

  // Questions
  createQuestion: (data: any) => api.post('/api/admin/questions', data),
  updateQuestion: (id: string, data: any) => api.patch(`/api/admin/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/api/admin/questions/${id}`),
  getQuestions: (params?: any) => api.get('/api/admin/questions', { params }),

  // Badges
  createBadge: (data: any) => api.post('/api/admin/badges', data),
  updateBadge: (id: string, data: any) => api.patch(`/api/admin/badges/${id}`, data),
  deleteBadge: (id: string) => api.delete(`/api/admin/badges/${id}`),

  // Stats
  getStats: () => api.get('/api/admin/stats'),
};

export default api;
