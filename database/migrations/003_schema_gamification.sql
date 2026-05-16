-- ============================================================================
-- StudySprint OS - Gamification Schema
-- Layer 3: XP, Levels, Badges, Skill Trees, Streaks
-- ============================================================================

-- ---------------------------------------------------------------------------
-- LEVELS (predefined level definitions)
-- ---------------------------------------------------------------------------
CREATE TABLE levels (
    id          INT PRIMARY KEY,
    level_name  TEXT NOT NULL,
    xp_required BIGINT NOT NULL,
    rewards     JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- XP_TRANSACTIONS (audit log for all XP changes)
-- ---------------------------------------------------------------------------
CREATE TABLE xp_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount          INT NOT NULL,
    balance_after   BIGINT NOT NULL,
    reason          TEXT NOT NULL
                      CHECK (reason IN (
                        'study_session', 'quiz_completed', 'streak_bonus',
                        'daily_login', 'badge_earned', 'challenge_completed',
                        'correct_answer', 'session_streak', 'level_up', 'bonus'
                      )),
    reference_type  TEXT,
    reference_id    UUID,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at);
CREATE INDEX idx_xp_transactions_reason ON xp_transactions(reason);

-- ---------------------------------------------------------------------------
-- BADGES (achievement definitions)
-- ---------------------------------------------------------------------------
CREATE TABLE badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url    TEXT,
    badge_type  TEXT NOT NULL DEFAULT 'achievement'
                  CHECK (badge_type IN (
                    'achievement', 'streak', 'mastery', 'speed',
                    'consistency', 'social', 'special', 'milestone'
                  )),
    rarity      TEXT NOT NULL DEFAULT 'common'
                  CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    criteria    JSONB NOT NULL DEFAULT '{}'::jsonb,
    xp_reward   INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- USER_BADGES (which user earned which badge)
-- ---------------------------------------------------------------------------
CREATE TABLE user_badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- ---------------------------------------------------------------------------
-- SKILL_TREES (subject-based skill trees)
-- ---------------------------------------------------------------------------
CREATE TABLE skill_trees (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    icon        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_trees_subject_id ON skill_trees(subject_id);

-- ---------------------------------------------------------------------------
-- USER_SKILLS (per-user mastery within skill trees)
-- ---------------------------------------------------------------------------
CREATE TABLE user_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_tree_id   UUID NOT NULL REFERENCES skill_trees(id) ON DELETE CASCADE,
    chapter_id      UUID REFERENCES chapters(id) ON DELETE SET NULL,
    mastery_level   INT NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
    xp_earned       INT NOT NULL DEFAULT 0,
    study_minutes   INT NOT NULL DEFAULT 0,
    quizzes_passed  INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_tree_id, chapter_id)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_tree_id ON user_skills(skill_tree_id);
CREATE INDEX idx_user_skills_mastery ON user_skills(mastery_level);

-- ---------------------------------------------------------------------------
-- STREAK_RECORDS (daily streak tracking)
-- ---------------------------------------------------------------------------
CREATE TABLE streak_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak      INT NOT NULL DEFAULT 0,
    longest_streak      INT NOT NULL DEFAULT 0,
    max_streak          INT NOT NULL DEFAULT 0,
    last_activity_date  DATE,
    freeze_count        INT NOT NULL DEFAULT 0,
    total_active_days   INT NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- DAILY_CHALLENGES (optional daily challenges for bonus XP)
-- ---------------------------------------------------------------------------
CREATE TABLE daily_challenges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    challenge_type TEXT NOT NULL
                      CHECK (challenge_type IN (
                        'study_minutes', 'quiz_score', 'sessions_count',
                        'streak_maintain', 'subject_focus'
                      )),
    requirement   INT NOT NULL,
    xp_reward     INT NOT NULL DEFAULT 50,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    valid_from    DATE NOT NULL,
    valid_to      DATE NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- USER_CHALLENGES (track user progress on daily challenges)
-- ---------------------------------------------------------------------------
CREATE TABLE user_challenges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_id  UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress      INT NOT NULL DEFAULT 0,
    is_completed  BOOLEAN NOT NULL DEFAULT false,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FOR USER_SKILLS & STREAK_RECORDS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER set_user_skills_updated_at
    BEFORE UPDATE ON public.user_skills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_streak_records_updated_at
    BEFORE UPDATE ON public.streak_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
