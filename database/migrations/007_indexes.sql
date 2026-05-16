-- ============================================================================
-- StudySprint OS - Performance Indexes
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ADDITIONAL COMPOSITE INDEXES FOR QUERY PERFORMANCE
-- ---------------------------------------------------------------------------

-- Study sessions: find sessions by user within date range
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date_range
    ON public.study_sessions(user_id, started_at, ended_at);

-- Study sessions: subject + user for subject-specific queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_subject
    ON public.study_sessions(user_id, subject_id);

-- Quiz attempts: user performance history
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed
    ON public.quiz_attempts(user_id, completed_at)
    WHERE status = 'completed';

-- XP transactions: user timeline
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_created
    ON public.xp_transactions(user_id, created_at DESC);

-- Room participants: currently focusing users
CREATE INDEX IF NOT EXISTS idx_room_participants_active
    ON public.room_participants(room_id, is_focusing)
    WHERE is_focusing = true;

-- Leaderboard: weekly/monthly rankings
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_type_rank
    ON public.leaderboard_snapshots(snapshot_type, snapshot_date, rank);

-- Mastery: tracking user progress over time
CREATE INDEX IF NOT EXISTS idx_mastery_snapshots_user_subject
    ON public.mastery_snapshots(user_id, subject_id, snapshot_date DESC);

-- Weak areas: priority-based querying
CREATE INDEX IF NOT EXISTS idx_weak_areas_user_unresolved
    ON public.weak_areas(user_id, weakness_score DESC)
    WHERE is_resolved = false;

-- Notifications / activity feed: recent sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_recent
    ON public.study_sessions(user_id, created_at DESC);

-- Textbook lookup by subject
CREATE INDEX IF NOT EXISTS idx_textbooks_user_subject
    ON public.textbooks(user_id, subject_id);

-- Daily logs: history by week/month
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_month
    ON public.daily_logs(user_id, log_date DESC);

-- Routine generation: today's routines
CREATE INDEX IF NOT EXISTS idx_user_routines_today
    ON public.user_routines(user_id, routine_date);

-- Streak checks
CREATE INDEX IF NOT EXISTS idx_streak_records_last_active
    ON public.streak_records(last_activity_date);

-- Profile XP for leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_xp_leaderboard
    ON public.profiles(xp_total DESC);

-- Questions: filtered by topic + type for quiz generation
CREATE INDEX IF NOT EXISTS idx_questions_topic_type_difficulty
    ON public.questions(topic_id, question_type, difficulty);

-- ---------------------------------------------------------------------------
-- GIN INDEXES FOR JSONB COLUMNS
-- ---------------------------------------------------------------------------

-- Subjects studied JSON in daily_logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_subjects_gin
    ON public.daily_logs USING GIN (subjects_studied);

-- Factors JSON in prediction_results
CREATE INDEX IF NOT EXISTS idx_prediction_results_factors_gin
    ON public.prediction_results USING GIN (factors);

-- Report data JSON
CREATE INDEX IF NOT EXISTS idx_report_history_data_gin
    ON public.report_history USING GIN (report_data);

-- Textbooks extracted data
CREATE INDEX IF NOT EXISTS idx_textbooks_extracted_gin
    ON public.textbooks USING GIN (extracted_data);

-- ---------------------------------------------------------------------------
-- PARTIAL INDEXES FOR COMMON FILTERS
-- ---------------------------------------------------------------------------

-- Active focus rooms
CREATE INDEX IF NOT EXISTS idx_focus_rooms_active_type
    ON public.focus_rooms(room_type)
    WHERE is_active = true;

-- Completed quizzes with scores
CREATE INDEX IF NOT EXISTS idx_quizzes_generated
    ON public.quizzes(subject_id, chapter_id)
    WHERE is_generated = true;

-- Resolved vs unresolved weak areas
CREATE INDEX IF NOT EXISTS idx_weak_areas_resolved
    ON public.weak_areas(user_id, is_resolved);

-- ---------------------------------------------------------------------------
-- FULL-TEXT SEARCH INDEXES (for future search feature)
-- ---------------------------------------------------------------------------

-- ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS search_vector tsvector
--     GENERATED ALWAYS AS (to_tsvector('english', name || ' ' || COALESCE(content_summary, ''))) STORED;
-- CREATE INDEX IF NOT EXISTS idx_topics_search ON public.topics USING GIN (search_vector);

-- ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS search_vector tsvector
--     GENERATED ALWAYS AS (to_tsvector('english', question_text || ' ' || COALESCE(explanation, ''))) STORED;
-- CREATE INDEX IF NOT EXISTS idx_questions_search ON public.questions USING GIN (search_vector);
