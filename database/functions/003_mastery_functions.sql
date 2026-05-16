-- ============================================================================
-- StudySprint OS - Mastery & Weak Area Functions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CALCULATE MASTERY LEVEL FOR A TOPIC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_topic_mastery(
    p_user_id UUID,
    p_topic_id UUID
)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_total_study_minutes INT;
    v_quiz_score DECIMAL(5,2);
    v_quiz_count INT;
    v_mastery INT;
    v_study_weight DECIMAL := 0.3;
    v_quiz_weight DECIMAL := 0.7;
BEGIN
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO v_total_study_minutes
    FROM public.study_sessions
    WHERE user_id = p_user_id AND topic_id = p_topic_id;

    SELECT
        COALESCE(AVG(percentage), 0),
        COUNT(*)
    INTO v_quiz_score, v_quiz_count
    FROM public.quiz_attempts qa
    JOIN public.quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = p_user_id
      AND q.topic_id = p_topic_id
      AND qa.status = 'completed';

    IF v_total_study_minutes = 0 AND v_quiz_count = 0 THEN
        RETURN 0;
    END IF;

    v_mastery := ROUND(
        (LEAST(v_total_study_minutes::DECIMAL / 120, 1.0) * 100 * v_study_weight) +
        (COALESCE(v_quiz_score, 0) * v_quiz_weight)
    );

    RETURN GREATEST(0, LEAST(100, v_mastery));
END;
$$;

-- ---------------------------------------------------------------------------
-- UPDATE MASTERY SNAPSHOT (called after quiz completion)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_mastery_on_quiz_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_topic_id UUID;
    v_mastery INT;
    v_quiz_info RECORD;
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        SELECT q.topic_id, q.subject_id INTO v_topic_id, v_quiz_info.subject_id
        FROM public.quizzes q
        WHERE q.id = NEW.quiz_id;

        IF v_topic_id IS NOT NULL THEN
            v_mastery := public.calculate_topic_mastery(NEW.user_id, v_topic_id);

            INSERT INTO public.mastery_snapshots (
                user_id, subject_id, topic_id, mastery_level,
                quiz_score, study_minutes, correct_answers, total_answers,
                snapshot_date
            )
            VALUES (
                NEW.user_id, v_quiz_info.subject_id, v_topic_id, v_mastery,
                NEW.percentage,
                COALESCE((SELECT SUM(duration_minutes) FROM public.study_sessions
                          WHERE user_id = NEW.user_id AND topic_id = v_topic_id), 0),
                NEW.correct_count,
                NEW.correct_count + NEW.incorrect_count,
                CURRENT_DATE
            );

            IF v_mastery < 40 THEN
                INSERT INTO public.weak_areas (user_id, subject_id, topic_id, weakness_score)
                VALUES (NEW.user_id, v_quiz_info.subject_id, v_topic_id, 100 - v_mastery)
                ON CONFLICT (user_id, topic_id) DO UPDATE SET
                    weakness_score = 100 - v_mastery,
                    last_reviewed = NOW(),
                    review_count = weak_areas.review_count + 1,
                    is_resolved = CASE WHEN v_mastery >= 40 THEN true ELSE false END;
            ELSIF v_mastery >= 80 THEN
                UPDATE public.weak_areas
                SET is_resolved = true, last_reviewed = NOW()
                WHERE user_id = NEW.user_id AND topic_id = v_topic_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_mastery_on_quiz_complete_trigger
    AFTER UPDATE ON public.quiz_attempts
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status = 'in_progress')
    EXECUTE FUNCTION public.update_mastery_on_quiz_complete();

-- ---------------------------------------------------------------------------
-- GENERATE DYNAMIC ROUTINE FOR A USER
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_daily_routine(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE,
    p_available_minutes INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_routine_id UUID;
    v_weak_topics RECORD;
    v_upcoming_topics RECORD;
    v_minutes_per_slot INT;
    v_remaining_minutes INT;
    v_slot_count INT := 0;
    v_result JSONB;
BEGIN
    v_remaining_minutes := p_available_minutes;

    INSERT INTO public.user_routines (user_id, routine_date, total_minutes)
    VALUES (p_user_id, p_date, p_available_minutes)
    RETURNING id INTO v_routine_id;

    FOR v_weak_topics IN
        SELECT wa.id, wa.subject_id, wa.topic_id, wa.weakness_score,
               s.name AS subject_name, t.name AS topic_name
        FROM public.weak_areas wa
        JOIN public.subjects s ON wa.subject_id = s.id
        JOIN public.topics t ON wa.topic_id = t.id
        WHERE wa.user_id = p_user_id
          AND wa.is_resolved = false
        ORDER BY wa.weakness_score DESC
        LIMIT 3
    LOOP
        IF v_remaining_minutes < 10 THEN EXIT; END IF;

        v_minutes_per_slot := LEAST(20, v_remaining_minutes);
        v_slot_count := v_slot_count + 1;

        INSERT INTO public.routine_slots (
            routine_id, subject_id, topic_id, slot_type,
            duration_minutes, display_order, reason
        ) VALUES (
            v_routine_id, v_weak_topics.subject_id, v_weak_topics.topic_id,
            'revision', v_minutes_per_slot, v_slot_count,
            format('Weak area: %s - %s (score: %s%%)',
                   v_weak_topics.subject_name, v_weak_topics.topic_name,
                   v_weak_topics.weakness_score)
        );

        v_remaining_minutes := v_remaining_minutes - v_minutes_per_slot;
    END LOOP;

    FOR v_upcoming_topics IN
        SELECT DISTINCT ss.subject_id, ss.topic_id,
               s.name AS subject_name, t.name AS topic_name
        FROM public.study_sessions ss
        JOIN public.subjects s ON ss.subject_id = s.id
        JOIN public.topics t ON ss.topic_id = t.id
        WHERE ss.user_id = p_user_id
          AND ss.topic_id IS NOT NULL
        ORDER BY ss.created_at DESC
        LIMIT 2
    LOOP
        IF v_remaining_minutes < 10 THEN EXIT; END IF;

        v_minutes_per_slot := LEAST(25, v_remaining_minutes);
        v_slot_count := v_slot_count + 1;

        INSERT INTO public.routine_slots (
            routine_id, subject_id, topic_id, slot_type,
            duration_minutes, display_order
        ) VALUES (
            v_routine_id, v_upcoming_topics.subject_id, v_upcoming_topics.topic_id,
            'study', v_minutes_per_slot, v_slot_count
        );

        v_remaining_minutes := v_remaining_minutes - v_minutes_per_slot;
    END LOOP;

    IF v_slot_count > 0 AND v_remaining_minutes >= 5 THEN
        v_slot_count := v_slot_count + 1;
        INSERT INTO public.routine_slots (
            routine_id, subject_id, slot_type,
            duration_minutes, display_order
        ) VALUES (
            v_routine_id,
            (SELECT subject_id FROM public.routine_slots WHERE routine_id = v_routine_id LIMIT 1),
            'quiz', v_remaining_minutes, v_slot_count
        );

        UPDATE public.user_routines
        SET total_minutes = p_available_minutes
        WHERE id = v_routine_id;
    END IF;

    v_result := jsonb_build_object(
        'routine_id', v_routine_id,
        'total_slots', v_slot_count,
        'total_minutes', p_available_minutes,
        'has_weak_area_revision', v_slot_count > 0
    );

    RETURN v_result;
END;
$$;
