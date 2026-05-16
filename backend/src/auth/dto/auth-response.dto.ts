export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    xp_total: number;
    level_id: number;
    current_streak: number;
    role: string;
  };
  access_token: string;
}

export interface ProfileResponse {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  grade_id: string | null;
  board_id: string | null;
  country_id: string | null;
  xp_total: number;
  level_id: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  is_onboarded: boolean;
  created_at: string;
}
