-- ============================================================================
-- StudySprint OS - Questions & Quizzes Schema
-- Layer 2 & 4: Questions, Question Options, Quizzes, Attempts, Answers
-- ============================================================================

-- ---------------------------------------------------------------------------
-- QUESTIONS (reusable question bank)
-- ---------------------------------------------------------------------------
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_type   TEXT NOT NULL
                      CHECK (question_type IN ('mcq', 'short', 'long', 'board', 'true_false', 'fill_blank', 'match')),
    difficulty      INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    question_text   TEXT NOT NULL,
    explanation     TEXT,
    points          INT NOT NULL DEFAULT 1,
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    source          TEXT DEFAULT 'system'
                      CHECK (source IN ('system', 'teacher', 'uploaded', 'ai_generated', 'community')),
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_topic_type ON questions(topic_id, question_type);

-- ---------------------------------------------------------------------------
-- QUESTION_OPTIONS (for MCQ / true-false questions)
-- ---------------------------------------------------------------------------
CREATE TABLE question_options (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text   TEXT NOT NULL,
    is_correct    BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);

-- ---------------------------------------------------------------------------
-- QUIZZES (container for a set of questions)
-- ---------------------------------------------------------------------------
CREATE TABLE quizzes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subject_id          UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_id          UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id            UUID REFERENCES topics(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    quiz_type           TEXT NOT NULL DEFAULT 'practice'
                          CHECK (quiz_type IN (
                            'practice', 'mock', 'revision', 'topic_wise',
                            'chapter_wise', 'board_style', 'daily_quiz'
                          )),
    difficulty          INT CHECK (difficulty BETWEEN 1 AND 5),
    time_limit_minutes  INT,
    passing_percentage  DECIMAL(5,2) DEFAULT 40.00,
    total_questions     INT NOT NULL DEFAULT 0,
    total_points        INT NOT NULL DEFAULT 0,
    is_generated        BOOLEAN NOT NULL DEFAULT false,
    is_public           BOOLEAN NOT NULL DEFAULT false,
    attempt_count       INT NOT NULL DEFAULT 0,
    avg_score           DECIMAL(5,2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_subject_id ON quizzes(subject_id);
CREATE INDEX idx_quizzes_chapter_id ON quizzes(chapter_id);
CREATE INDEX idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX idx_quizzes_type ON quizzes(quiz_type);

-- ---------------------------------------------------------------------------
-- QUIZ_QUESTIONS (junction: which questions belong to which quiz)
-- ---------------------------------------------------------------------------
CREATE TABLE quiz_questions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    points        INT NOT NULL DEFAULT 1,
    UNIQUE(quiz_id, question_id)
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_question_id ON quiz_questions(question_id);

-- ---------------------------------------------------------------------------
-- QUIZ_ATTEMPTS (each time a user takes a quiz)
-- ---------------------------------------------------------------------------
CREATE TABLE quiz_attempts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id             UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at        TIMESTAMPTZ,
    score               DECIMAL(5,2),
    total_possible      DECIMAL(5,2),
    percentage          DECIMAL(5,2),
    correct_count       INT DEFAULT 0,
    incorrect_count     INT DEFAULT 0,
    unanswered_count    INT DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'in_progress'
                          CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    time_taken_seconds  INT,
    xp_earned           INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

-- ---------------------------------------------------------------------------
-- USER_ANSWERS (individual answer within an attempt)
-- ---------------------------------------------------------------------------
CREATE TABLE user_answers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id          UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id         UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id  UUID REFERENCES question_options(id) ON DELETE SET NULL,
    text_answer         TEXT,
    is_correct          BOOLEAN,
    marks_obtained      DECIMAL(5,2) DEFAULT 0,
    max_marks           DECIMAL(5,2) DEFAULT 1,
    time_taken_seconds  INT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(attempt_id, question_id)
);

CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER set_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
