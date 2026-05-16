-- ============================================================================
-- StudySprint OS - Focus Rooms Schema
-- Layer 3: Focus Rooms, Participants, Room Messages, Leaderboard
-- ============================================================================

-- ---------------------------------------------------------------------------
-- FOCUS_ROOMS (live virtual study rooms)
-- ---------------------------------------------------------------------------
CREATE TABLE focus_rooms (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    description       TEXT,
    room_type         TEXT NOT NULL DEFAULT 'silent_focus'
                        CHECK (room_type IN (
                          'exam_prep', 'silent_focus', 'night_study',
                          'subject_specific', 'group_study', 'pomodoro'
                        )),
    subject_id        UUID REFERENCES subjects(id) ON DELETE SET NULL,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    is_private        BOOLEAN NOT NULL DEFAULT false,
    access_code       TEXT,
    max_participants  INT NOT NULL DEFAULT 50 CHECK (max_participants > 0),
    current_count     INT NOT NULL DEFAULT 0,
    total_focus_minutes INT NOT NULL DEFAULT 0,
    created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_focus_rooms_room_type ON focus_rooms(room_type);
CREATE INDEX idx_focus_rooms_subject_id ON focus_rooms(subject_id);
CREATE INDEX idx_focus_rooms_is_active ON focus_rooms(is_active);

-- ---------------------------------------------------------------------------
-- ROOM_PARTICIPANTS (tracks who is/was in a room)
-- ---------------------------------------------------------------------------
CREATE TABLE room_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at         TIMESTAMPTZ,
    focus_minutes   INT NOT NULL DEFAULT 0,
    is_focusing     BOOLEAN NOT NULL DEFAULT true,
    is_muted        BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(room_id, user_id, left_at)
);

CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_room_participants_focusing ON room_participants(is_focusing);

-- ---------------------------------------------------------------------------
-- ROOM_MESSAGES (chat messages within a room)
-- ---------------------------------------------------------------------------
CREATE TABLE room_messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id       UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message       TEXT NOT NULL,
    message_type  TEXT NOT NULL DEFAULT 'text'
                    CHECK (message_type IN ('text', 'system', 'milestone', 'streak_alert')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX idx_room_messages_created_at ON room_messages(created_at);

-- ---------------------------------------------------------------------------
-- ROOM_FOCUS_SESSIONS (individual focus timer sessions within a room)
-- ---------------------------------------------------------------------------
CREATE TABLE room_focus_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    duration_minutes INT NOT NULL DEFAULT 0,
    is_completed    BOOLEAN NOT NULL DEFAULT false,
    paused_seconds  INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_room_focus_sessions_room_id ON room_focus_sessions(room_id);
CREATE INDEX idx_room_focus_sessions_user_id ON room_focus_sessions(user_id);

-- ---------------------------------------------------------------------------
-- LEADERBOARD_SNAPSHOTS (periodic leaderboard captures)
-- ---------------------------------------------------------------------------
CREATE TABLE leaderboard_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_type   TEXT NOT NULL
                      CHECK (snapshot_type IN (
                        'daily', 'weekly', 'monthly', 'all_time'
                      )),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rank            INT NOT NULL,
    xp_total        BIGINT NOT NULL,
    study_minutes   INT NOT NULL,
    streak_length   INT NOT NULL,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    snapshot_date   DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leaderboard_snapshots_type_date ON leaderboard_snapshots(snapshot_type, snapshot_date);
CREATE INDEX idx_leaderboard_snapshots_user_id ON leaderboard_snapshots(user_id);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FOR FOCUS_ROOMS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER set_focus_rooms_updated_at
    BEFORE UPDATE ON public.focus_rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
