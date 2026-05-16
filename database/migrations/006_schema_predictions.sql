-- ============================================================================
-- StudySprint OS - Predictions & Reports Schema
-- Layer 4: Predictions, Mastery Snapshots, Reports, Routines
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PREDICTION_RESULTS (AI-driven academic predictions)
-- ---------------------------------------------------------------------------
CREATE TABLE prediction_results (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prediction_type   TEXT NOT NULL
                        CHECK (prediction_type IN (
                          'quiz_performance', 'topic_mastery', 'exam_readiness',
                          'gpa_trend', 'consistency_score', 'completion_forecast'
                        )),
    subject_id        UUID REFERENCES subjects(id) ON DELETE SET NULL,
    chapter_id        UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id          UUID REFERENCES topics(id) ON DELETE SET NULL,
    predicted_score   DECIMAL(5,2),
    confidence        DECIMAL(5,2) CHECK (confidence BETWEEN 0 AND 100),
    min_range         DECIMAL(5,2),
    max_range         DECIMAL(5,2),
    factors           JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations   JSONB DEFAULT '[]'::jsonb,
    input_snapshot    JSONB DEFAULT '{}'::jsonb,
    model_version     TEXT DEFAULT 'v1',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prediction_results_user_id ON prediction_results(user_id);
CREATE INDEX idx_prediction_results_type ON prediction_results(prediction_type);
CREATE INDEX idx_prediction_results_subject_id ON prediction_results(subject_id);
CREATE INDEX idx_prediction_results_created_at ON prediction_results(created_at);

-- ---------------------------------------------------------------------------
-- MASTERY_SNAPSHOTS (per-topic mastery over time)
-- ---------------------------------------------------------------------------
CREATE TABLE mastery_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    mastery_level   INT NOT NULL CHECK (mastery_level BETWEEN 0 AND 100),
    quiz_score      DECIMAL(5,2),
    study_minutes   INT NOT NULL DEFAULT 0,
    sessions_count  INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    total_answers   INT NOT NULL DEFAULT 0,
    snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mastery_snapshots_user_id ON mastery_snapshots(user_id);
CREATE INDEX idx_mastery_snapshots_topic_id ON mastery_snapshots(topic_id);
CREATE INDEX idx_mastery_snapshots_date ON mastery_snapshots(snapshot_date);
CREATE INDEX idx_mastery_snapshots_user_topic_date ON mastery_snapshots(user_id, topic_id, snapshot_date);

-- ---------------------------------------------------------------------------
-- WEAK_AREAS (identified weak topics that need revision)
-- ---------------------------------------------------------------------------
CREATE TABLE weak_areas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    weakness_score  DECIMAL(5,2) NOT NULL CHECK (weakness_score BETWEEN 0 AND 100),
    identified_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_reviewed   TIMESTAMPTZ,
    review_count    INT NOT NULL DEFAULT 0,
    is_resolved     BOOLEAN NOT NULL DEFAULT false,
    notes           TEXT,
    UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_weak_areas_user_id ON weak_areas(user_id);
CREATE INDEX idx_weak_areas_subject_id ON weak_areas(subject_id);
CREATE INDEX idx_weak_areas_weakness ON weak_areas(weakness_score DESC);

-- ---------------------------------------------------------------------------
-- USER_ROUTINES (dynamic daily study plans)
-- ---------------------------------------------------------------------------
CREATE TABLE user_routines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    routine_date    DATE NOT NULL,
    total_minutes   INT NOT NULL DEFAULT 0,
    is_completed    BOOLEAN NOT NULL DEFAULT false,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, routine_date)
);

CREATE INDEX idx_user_routines_user_id ON user_routines(user_id);
CREATE INDEX idx_user_routines_date ON user_routines(routine_date);

-- ---------------------------------------------------------------------------
-- ROUTINE_SLOTS (individual study blocks within a routine)
-- ---------------------------------------------------------------------------
CREATE TABLE routine_slots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id      UUID NOT NULL REFERENCES user_routines(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_id      UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id        UUID REFERENCES topics(id) ON DELETE SET NULL,
    slot_type       TEXT NOT NULL DEFAULT 'study'
                      CHECK (slot_type IN ('study', 'revision', 'quiz', 'break', 'review')),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    display_order   INT NOT NULL DEFAULT 0,
    is_completed    BOOLEAN NOT NULL DEFAULT false,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_routine_slots_routine_id ON routine_slots(routine_id);

-- ---------------------------------------------------------------------------
-- REPORT_HISTORY (generated printable reports)
-- ---------------------------------------------------------------------------
CREATE TABLE report_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    report_type     TEXT NOT NULL
                      CHECK (report_type IN ('weekly', 'monthly', 'custom', 'academic', 'parent')),
    title           TEXT NOT NULL,
    report_data     JSONB NOT NULL DEFAULT '{}'::jsonb,
    pdf_url         TEXT,
    date_range_start DATE NOT NULL,
    date_range_end   DATE NOT NULL,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_history_user_id ON report_history(user_id);
CREATE INDEX idx_report_history_generated_at ON report_history(generated_at);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER set_user_routines_updated_at
    BEFORE UPDATE ON public.user_routines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
