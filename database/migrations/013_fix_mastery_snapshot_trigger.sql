-- ============================================================================
-- Fix: process_study_session_end trigger crashes when topic_id is NULL.
-- Skip the mastery snapshot when the session has no topic AND no chapter
-- (which is the normal "Start Focus" path without picking a curriculum item).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.process_study_session_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_xp INT;
    v_resolved_topic_id UUID;
BEGIN
    IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
        v_xp := public.calculate_session_xp(NEW.duration_minutes, NEW.session_type);

        NEW.xp_earned := v_xp;

        INSERT INTO public.daily_logs (user_id, log_date, total_minutes, sessions_count, subjects_studied, xp_earned)
        VALUES (
            NEW.user_id,
            DATE(NEW.started_at),
            NEW.duration_minutes,
            1,
            jsonb_build_array(jsonb_build_object(
                'subject_id', NEW.subject_id,
                'minutes', NEW.duration_minutes
            )),
            v_xp
        )
        ON CONFLICT (user_id, log_date) DO UPDATE SET
            total_minutes = daily_logs.total_minutes + NEW.duration_minutes,
            sessions_count = daily_logs.sessions_count + 1,
            subjects_studied = CASE
                WHEN daily_logs.subjects_studied IS NULL THEN
                    jsonb_build_array(jsonb_build_object(
                        'subject_id', NEW.subject_id,
                        'minutes', NEW.duration_minutes
                    ))
                ELSE
                    daily_logs.subjects_studied || jsonb_build_object(
                        'subject_id', NEW.subject_id,
                        'minutes', NEW.duration_minutes
                    )
            END,
            xp_earned = daily_logs.xp_earned + v_xp;

        -- Resolve a topic_id only if the session has one (or we can derive one from chapter).
        v_resolved_topic_id := COALESCE(
            NEW.topic_id,
            (SELECT id FROM public.topics WHERE chapter_id = NEW.chapter_id ORDER BY display_order LIMIT 1)
        );

        -- Only write the mastery snapshot when we actually have BOTH subject and topic.
        -- Generic focus sessions without curriculum context skip this entirely.
        IF v_resolved_topic_id IS NOT NULL AND NEW.subject_id IS NOT NULL THEN
            INSERT INTO public.mastery_snapshots (
                user_id, subject_id, topic_id, mastery_level,
                study_minutes, sessions_count, snapshot_date
            )
            VALUES (
                NEW.user_id, NEW.subject_id, v_resolved_topic_id,
                0, NEW.duration_minutes, 1, CURRENT_DATE
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;