-- ============================================================================
-- StudySprint OS - Core Schema
-- Layer 1: Study Data (Countries, Boards, Grades, Subjects, Chapters, Topics)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- COUNTRIES
-- ---------------------------------------------------------------------------
CREATE TABLE countries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    code        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- BOARDS (e.g. CBSE, ICSE, IB, State Board, A-Levels)
-- ---------------------------------------------------------------------------
CREATE TABLE boards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id  UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boards_country_id ON boards(country_id);

-- ---------------------------------------------------------------------------
-- GRADES (e.g. Class 10, Grade 12, Year 11)
-- ---------------------------------------------------------------------------
CREATE TABLE grades (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id      UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grades_board_id ON grades(board_id);

-- ---------------------------------------------------------------------------
-- SUBJECTS (e.g. Mathematics, Physics, English)
-- ---------------------------------------------------------------------------
CREATE TABLE subjects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    icon        TEXT,
    color       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- GRADE_SUBJECTS (many-to-many: which subjects belong to which grades)
-- ---------------------------------------------------------------------------
CREATE TABLE grade_subjects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id    UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(grade_id, subject_id)
);

CREATE INDEX idx_grade_subjects_grade_id ON grade_subjects(grade_id);
CREATE INDEX idx_grade_subjects_subject_id ON grade_subjects(subject_id);

-- ---------------------------------------------------------------------------
-- CHAPTERS
-- ---------------------------------------------------------------------------
CREATE TABLE chapters (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id    UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    grade_id      UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_chapters_grade_id ON chapters(grade_id);

-- ---------------------------------------------------------------------------
-- TOPICS
-- ---------------------------------------------------------------------------
CREATE TABLE topics (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id        UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    display_order     INT NOT NULL DEFAULT 0,
    content_summary   TEXT,
    learning_outcomes JSONB DEFAULT '[]'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topics_chapter_id ON topics(chapter_id);

-- ---------------------------------------------------------------------------
-- LEARNING_OUTCOMES (explicit outcome nodes linked to topics)
-- ---------------------------------------------------------------------------
CREATE TABLE learning_outcomes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    outcome     TEXT NOT NULL,
    code        TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_outcomes_topic_id ON learning_outcomes(topic_id);

-- ---------------------------------------------------------------------------
-- PROFILES (extends Supabase auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        TEXT UNIQUE,
    display_name    TEXT,
    avatar_url      TEXT,
    bio             TEXT,
    grade_id        UUID REFERENCES grades(id) ON DELETE SET NULL,
    board_id        UUID REFERENCES boards(id) ON DELETE SET NULL,
    country_id      UUID REFERENCES countries(id) ON DELETE SET NULL,
    xp_total        BIGINT NOT NULL DEFAULT 0,
    level_id        INT NOT NULL DEFAULT 1,
    current_streak  INT NOT NULL DEFAULT 0,
    longest_streak  INT NOT NULL DEFAULT 0,
    last_study_date DATE,
    is_onboarded    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_grade_id ON profiles(grade_id);
CREATE INDEX idx_profiles_level_id ON profiles(level_id);

-- ---------------------------------------------------------------------------
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FOR PROFILES
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
