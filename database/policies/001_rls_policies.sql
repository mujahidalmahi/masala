-- ============================================================================
-- StudySprint OS - Row Level Security Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- HELPER: auth.user_id() for cleaner policies
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claim.sub', true),
        (SELECT id FROM auth.users LIMIT 1)  -- fallback for development
    )::UUID;
$$;

-- ---------------------------------------------------------------------------
-- PROFILES: users can read all profiles, update only their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- CURRICULUM DATA: public read-only for all authenticated users
-- ---------------------------------------------------------------------------
CREATE POLICY "Countries are viewable by all authenticated users"
    ON public.countries FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Boards are viewable by all authenticated users"
    ON public.boards FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Grades are viewable by all authenticated users"
    ON public.grades FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Subjects are viewable by all authenticated users"
    ON public.subjects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Grade_subjects are viewable by all authenticated users"
    ON public.grade_subjects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Chapters are viewable by all authenticated users"
    ON public.chapters FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Topics are viewable by all authenticated users"
    ON public.topics FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Learning outcomes are viewable by all authenticated users"
    ON public.learning_outcomes FOR SELECT
    USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- STUDY SESSIONS: users manage their own sessions
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own study sessions"
    ON public.study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
    ON public.study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
    ON public.study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- DAILY LOGS: users manage their own logs
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own daily logs"
    ON public.daily_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily logs"
    ON public.daily_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
    ON public.daily_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- TEXTBOOKS & FILES: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own textbooks"
    ON public.textbooks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create textbooks"
    ON public.textbooks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own textbooks"
    ON public.textbooks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own textbooks"
    ON public.textbooks FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own textbook chapters"
    ON public.textbook_chapters FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM public.textbooks WHERE id = textbook_id));

CREATE POLICY "Users can view own uploaded files"
    ON public.uploaded_files FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files"
    ON public.uploaded_files FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploaded files"
    ON public.uploaded_files FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own extracted content"
    ON public.extracted_content FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM public.uploaded_files WHERE id = file_id));

-- ---------------------------------------------------------------------------
-- GAMIFICATION: users see their own XP, badges, skills; levels/badges public
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own XP transactions"
    ON public.xp_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Levels are viewable by all"
    ON public.levels FOR SELECT
    USING (true);

CREATE POLICY "Badges are viewable by all"
    ON public.badges FOR SELECT
    USING (true);

CREATE POLICY "Users can view own badges"
    ON public.user_badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Skill trees are viewable by all"
    ON public.skill_trees FOR SELECT
    USING (true);

CREATE POLICY "Users can view own skills"
    ON public.user_skills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
    ON public.user_skills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streak"
    ON public.streak_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges"
    ON public.user_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
    ON public.user_challenges FOR UPDATE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- QUESTIONS: all authenticated users can read questions
-- ---------------------------------------------------------------------------
CREATE POLICY "Questions are viewable by all authenticated users"
    ON public.questions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Question options are viewable by all authenticated users"
    ON public.question_options FOR SELECT
    USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- QUIZZES: users can read, create, update their own; public quizzes readable
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own quizzes or public quizzes"
    ON public.quizzes FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes"
    ON public.quizzes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view quiz questions for accessible quizzes"
    ON public.quiz_questions FOR SELECT
    USING (
        auth.uid() = (SELECT user_id FROM public.quizzes WHERE id = quiz_id)
        OR (SELECT is_public FROM public.quizzes WHERE id = quiz_id) = true
    );

-- ---------------------------------------------------------------------------
-- QUIZ ATTEMPTS & ANSWERS: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
    ON public.quiz_attempts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own answers"
    ON public.user_answers FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM public.quiz_attempts WHERE id = attempt_id));

CREATE POLICY "Users can create own answers"
    ON public.user_answers FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM public.quiz_attempts WHERE id = attempt_id));

-- ---------------------------------------------------------------------------
-- FOCUS ROOMS: authenticated users can view active rooms
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can view active rooms"
    ON public.focus_rooms FOR SELECT
    USING (is_active = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create rooms"
    ON public.focus_rooms FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
    ON public.focus_rooms FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can view room participants"
    ON public.room_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join rooms"
    ON public.room_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
    ON public.room_participants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view room messages"
    ON public.room_messages FOR SELECT
    USING (true);

CREATE POLICY "Users can send messages"
    ON public.room_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own focus sessions"
    ON public.room_focus_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own focus sessions"
    ON public.room_focus_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
    ON public.room_focus_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- LEADERBOARD & DAILY CHALLENGES: public read
-- ---------------------------------------------------------------------------
CREATE POLICY "Leaderboard snapshots are viewable by all"
    ON public.leaderboard_snapshots FOR SELECT
    USING (true);

CREATE POLICY "Daily challenges are viewable by all"
    ON public.daily_challenges FOR SELECT
    USING (true);

-- ---------------------------------------------------------------------------
-- PREDICTIONS & ANALYTICS: users see their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own predictions"
    ON public.prediction_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mastery snapshots"
    ON public.mastery_snapshots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own weak areas"
    ON public.weak_areas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own weak areas"
    ON public.weak_areas FOR UPDATE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ROUTINES: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own routines"
    ON public.user_routines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own routines"
    ON public.user_routines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
    ON public.user_routines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own routine slots"
    ON public.routine_slots FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM public.user_routines WHERE id = routine_id));

CREATE POLICY "Users can update own routine slots"
    ON public.routine_slots FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM public.user_routines WHERE id = routine_id));

-- ---------------------------------------------------------------------------
-- REPORTS: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own reports"
    ON public.report_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
    ON public.report_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- STORAGE: files bucket policies
-- ---------------------------------------------------------------------------
-- Note: Run these in Supabase Dashboard SQL editor
-- CREATE POLICY "Give users access to own folder"
--     ON storage.objects FOR ALL
--     USING (auth.uid()::text = (storage.foldername(name))[1])
--     WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
