-- ============================================================================
-- StudySprint OS - Study Tracking Schema
-- Layer 1 & 2: Study Sessions, Daily Logs, Textbooks, Uploads, Extracted Content
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STUDY_SESSIONS (core tracking unit)
-- ---------------------------------------------------------------------------
CREATE TABLE study_sessions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id        UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_id        UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id          UUID REFERENCES topics(id) ON DELETE SET NULL,
    duration_minutes  INT NOT NULL CHECK (duration_minutes > 0),
    session_type      TEXT NOT NULL DEFAULT 'focus'
                        CHECK (session_type IN ('focus', 'revision', 'practice', 'quiz', 'reading')),
    notes             TEXT,
    xp_earned         INT NOT NULL DEFAULT 0,
    started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at          TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX idx_study_sessions_chapter_id ON study_sessions(chapter_id);
CREATE INDEX idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX idx_study_sessions_user_date ON study_sessions(user_id, started_at);

-- ---------------------------------------------------------------------------
-- DAILY_LOGS (aggregated daily summary per user)
-- ---------------------------------------------------------------------------
CREATE TABLE daily_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date          DATE NOT NULL,
    total_minutes     INT NOT NULL DEFAULT 0,
    sessions_count    INT NOT NULL DEFAULT 0,
    subjects_studied  JSONB DEFAULT '[]'::jsonb,
    xp_earned         INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);

-- ---------------------------------------------------------------------------
-- TEXTBOOKS (uploaded textbook or PDF metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE textbooks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    author          TEXT,
    file_url        TEXT,
    file_type       TEXT NOT NULL DEFAULT 'pdf'
                      CHECK (file_type IN ('pdf', 'image', 'doc', 'txt', 'epub')),
    status          TEXT NOT NULL DEFAULT 'processing'
                      CHECK (status IN ('processing', 'ready', 'error')),
    extracted_data  JSONB DEFAULT '{}'::jsonb,
    page_count      INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_textbooks_user_id ON textbooks(user_id);
CREATE INDEX idx_textbooks_subject_id ON textbooks(subject_id);

-- ---------------------------------------------------------------------------
-- TEXTBOOK_CHAPTERS (extracted chapters from uploaded textbooks)
-- ---------------------------------------------------------------------------
CREATE TABLE textbook_chapters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    textbook_id     UUID NOT NULL REFERENCES textbooks(id) ON DELETE CASCADE,
    chapter_id      UUID REFERENCES chapters(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    page_start      INT,
    page_end        INT,
    display_order   INT NOT NULL DEFAULT 0,
    content_text    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_textbook_chapters_textbook_id ON textbook_chapters(textbook_id);
CREATE INDEX idx_textbook_chapters_chapter_id ON textbook_chapters(chapter_id);

-- ---------------------------------------------------------------------------
-- UPLOADED_FILES (generic file uploads - notes, screenshots, handwritten)
-- ---------------------------------------------------------------------------
CREATE TABLE uploaded_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    textbook_id     UUID REFERENCES textbooks(id) ON DELETE SET NULL,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    chapter_id      UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id        UUID REFERENCES topics(id) ON DELETE SET NULL,
    file_name       TEXT NOT NULL,
    file_url        TEXT NOT NULL,
    file_type       TEXT NOT NULL,
    file_size       BIGINT NOT NULL DEFAULT 0,
    file_category   TEXT NOT NULL DEFAULT 'note'
                      CHECK (file_category IN ('note', 'screenshot', 'handwritten', 'worksheet', 'reference', 'other')),
    extracted_text  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_textbook_id ON uploaded_files(textbook_id);
CREATE INDEX idx_uploaded_files_subject_id ON uploaded_files(subject_id);

-- ---------------------------------------------------------------------------
-- EXTRACTED_CONTENT (parsed content from files / OCR)
-- ---------------------------------------------------------------------------
CREATE TABLE extracted_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id         UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    topic_id        UUID REFERENCES topics(id) ON DELETE SET NULL,
    content_type    TEXT NOT NULL DEFAULT 'text'
                      CHECK (content_type IN ('text', 'heading', 'formula', 'definition', 'example', 'practice')),
    content         TEXT NOT NULL,
    page_number     INT,
    confidence      DECIMAL(5,2),
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_extracted_content_file_id ON extracted_content(file_id);
CREATE INDEX idx_extracted_content_topic_id ON extracted_content(topic_id);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FOR TEXTBOOKS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER set_textbooks_updated_at
    BEFORE UPDATE ON public.textbooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
