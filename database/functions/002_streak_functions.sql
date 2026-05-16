-- ============================================================================
-- StudySprint OS - Streak Functions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CHECK AND UPDATE STREAK
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_current_streak INT;
    v_longest_streak INT;
    v_max_streak INT;
    v_total_active_days INT;
    v_new_streak INT;
    v_bonus_xp INT := 0;
    v_result JSONB;
BEGIN
    SELECT last_activity_date, current_streak, longest_streak, max_streak, total_active_days
    INTO v_last_date, v_current_streak, v_longest_streak, v_max_streak, v_total_active_days
    FROM public.streak_records
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.streak_records (user_id, current_streak, longest_streak, max_streak, last_activity_date, total_active_days)
        VALUES (p_user_id, 1, 1, 1, v_today, 1);

        UPDATE public.profiles
        SET current_streak = 1,
            longest_streak = 1,
            last_study_date = v_today
        WHERE id = p_user_id;

        RETURN jsonb_build_object(
            'streak_type', 'new',
            'current_streak', 1,
            'longest_streak', 1,
            'bonus_xp', 0,
            'message', 'Streak started!'
        );
    END IF;

    IF v_last_date = v_today THEN
        RETURN jsonb_build_object(
            'streak_type', 'already_active',
            'current_streak', v_current_streak,
            'longest_streak', v_longest_streak,
            'bonus_xp', 0,
            'message', 'Already studied today!'
        );
    END IF;

    IF v_last_date = v_yesterday THEN
        v_new_streak := v_current_streak + 1;
    ELSE
        v_new_streak := 1;
    END IF;

    IF v_new_streak > v_longest_streak THEN
        v_longest_streak := v_new_streak;
    END IF;

    IF v_new_streak > v_max_streak THEN
        v_max_streak := v_new_streak;
    END IF;

    v_total_active_days := v_total_active_days + 1;

    IF v_new_streak > 1 AND v_new_streak % 7 = 0 THEN
        v_bonus_xp := 50;
    ELSIF v_new_streak > 1 AND v_new_streak % 30 = 0 THEN
        v_bonus_xp := 200;
    ELSIF v_new_streak > 1 AND v_new_streak % 100 = 0 THEN
        v_bonus_xp := 500;
    END IF;

    UPDATE public.streak_records
    SET current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        max_streak = v_max_streak,
        last_activity_date = v_today,
        total_active_days = v_total_active_days,
        updated_at = now()
    WHERE user_id = p_user_id;

    UPDATE public.profiles
    SET current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_study_date = v_today
    WHERE id = p_user_id;

    IF v_bonus_xp > 0 THEN
        PERFORM public.add_xp(
            p_user_id, v_bonus_xp, 'streak_bonus',
            'streak_milestone', NULL,
            jsonb_build_object('streak', v_new_streak, 'bonus_type', 'streak_milestone')
        );
    END IF;

    v_result := jsonb_build_object(
        'streak_type', CASE WHEN v_new_streak = 1 THEN 'restarted' ELSE 'continued' END,
        'current_streak', v_new_streak,
        'longest_streak', v_longest_streak,
        'total_active_days', v_total_active_days,
        'bonus_xp', v_bonus_xp,
        'message', CASE
            WHEN v_new_streak = 1 THEN 'Streak restarted!'
            ELSE format('Streak continued! %s days', v_new_streak)
        END
    );

    RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- PROCESS END OF STUDY SESSION (XP + Streak + Daily Log)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_study_session_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_xp INT;
    v_streak_result JSONB;
    v_current_log_total INT;
    v_current_log_sessions INT;
    v_current_log_xp INT;
    v_existing_subjects JSONB;
    v_subject_info RECORD;
BEGIN
    IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
        NEW.duration_minutes := GREATEST(1, ROUND(NEW.duration_minutes)::INT);

        v_xp := public.calculate_session_xp(NEW.duration_minutes, NEW.session_type);
        NEW.xp_earned := v_xp;

        PERFORM public.add_xp(
            NEW.user_id, v_xp, 'study_session',
            'study_session', NEW.id,
            jsonb_build_object(
                'subject_id', NEW.subject_id,
                'session_type', NEW.session_type,
                'duration', NEW.duration_minutes
            )
        );

        v_streak_result := public.update_streak(NEW.user_id);

        INSERT INTO public.daily_logs (user_id, log_date, total_minutes, sessions_count, subjects_studied, xp_earned)
        VALUES (NEW.user_id, CURRENT_DATE, NEW.duration_minutes, 1,
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

        INSERT INTO public.mastery_snapshots (
            user_id, subject_id, topic_id, mastery_level,
            study_minutes, sessions_count, snapshot_date
        )
        VALUES (
            NEW.user_id, NEW.subject_id, COALESCE(NEW.topic_id, (SELECT id FROM public.topics WHERE chapter_id = NEW.chapter_id ORDER BY display_order LIMIT 1)),
            0, NEW.duration_minutes, 1, CURRENT_DATE
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER process_study_session_end_trigger
    BEFORE UPDATE ON public.study_sessions
    FOR EACH ROW
    WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
    EXECUTE FUNCTION public.process_study_session_end();
