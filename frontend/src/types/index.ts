export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  xp_total: number;
  level_id: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  grade_id: string | null;
  board_id: string | null;
  country_id: string | null;
  is_onboarded: boolean;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export interface Chapter {
  id: string;
  subject_id: string;
  grade_id: string;
  name: string;
  display_order: number;
  description: string | null;
  subjects?: { name: string };
  topics?: Topic[];
}

export interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  display_order: number;
  content_summary: string | null;
  learning_outcomes: string[];
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  chapter_id: string | null;
  topic_id: string | null;
  duration_minutes: number;
  session_type: 'focus' | 'revision' | 'practice' | 'quiz' | 'reading';
  notes: string | null;
  xp_earned: number;
  started_at: string;
  ended_at: string | null;
  subjects?: { name: string };
  chapters?: { name: string };
  topics?: { name: string };
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  quiz_type: string;
  difficulty: number | null;
  time_limit_minutes: number | null;
  total_questions: number;
  total_points: number;
  passing_percentage: number;
  is_generated: boolean;
  subjects?: { name: string };
  chapters?: { name: string };
  topics?: { name: string };
  questions?: Question[];
}

export interface Question {
  id: string;
  topic_id: string;
  question_type: 'mcq' | 'short' | 'long' | 'board' | 'true_false';
  difficulty: number;
  question_text: string;
  explanation: string | null;
  points: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_possible: number | null;
  percentage: number | null;
  correct_count: number;
  incorrect_count: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  xp_earned: number;
  quizzes?: Quiz;
  answers?: UserAnswer[];
}

export interface UserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  text_answer: string | null;
  is_correct: boolean | null;
  marks_obtained: number | null;
  questions?: Question;
  question_options?: QuestionOption;
}

export interface FocusRoom {
  id: string;
  name: string;
  description: string | null;
  room_type: string;
  subject_id: string | null;
  is_active: boolean;
  is_private: boolean;
  max_participants: number;
  current_count: number;
  total_focus_minutes: number;
  created_by: string;
  subjects?: { name: string };
  profiles?: { username: string; display_name: string; avatar_url: string };
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  focus_minutes: number;
  is_focusing: boolean;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    xp_total: number;
    level_id: number;
    current_streak: number;
  };
}

export interface GamificationProfile {
  xp_total: number;
  level_id: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  next_level: any;
  recent_xp: any[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  badge_type: string;
  rarity: string;
  xp_reward: number;
}

export interface DashboardData {
  profile: User;
  today: any;
  streak: any;
  weak_areas: any[];
  recent_sessions: StudySession[];
  next_level: any;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  xp_total: number;
  level_id: number;
  current_streak: number;
  total_study_minutes: number;
}

export interface Routine {
  id: string;
  routine_date: string;
  total_minutes: number;
  is_completed: boolean;
  slots: RoutineSlot[];
}

export interface RoutineSlot {
  id: string;
  routine_id: string;
  subject_id: string;
  slot_type: string;
  duration_minutes: number;
  display_order: number;
  is_completed: boolean;
  subjects?: { name: string };
  chapters?: { name: string };
  topics?: { name: string };
}
