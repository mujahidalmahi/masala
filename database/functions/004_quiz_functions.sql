-- ============================================================================
-- StudySprint OS - Quiz Generation & Scoring Functions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- GENERATE QUIZ FROM TOPIC (auto-create quiz from question bank)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_topic_quiz(
    p_user_id UUID,
    p_topic_id UUID,
    p_question_count INT DEFAULT 10,
    p_quiz_type TEXT DEFAULT 'practice'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_subject_id UUID;
    v_chapter_id UUID;
    v_quiz_id UUID;
    v_question RECORD;
    v_count INT := 0;
BEGIN
    SELECT subject_id, chapter_id INTO v_subject_id, v_chapter_id
    FROM public.topics WHERE id = p_topic_id;

    INSERT INTO public.quizzes (
        user_id, subject_id, chapter_id, topic_id,
        title, quiz_type, total_questions, is_generated
    ) VALUES (
        p_user_id, v_subject_id, v_chapter_id, p_topic_id,
        (SELECT name FROM public.topics WHERE id = p_topic_id) || ' Quiz',
        p_quiz_type, p_question_count, true
    ) RETURNING id INTO v_quiz_id;

    FOR v_question IN
        SELECT id, points FROM public.questions
        WHERE topic_id = p_topic_id AND is_verified = true
        ORDER BY random()
        LIMIT p_question_count
    LOOP
        v_count := v_count + 1;
        INSERT INTO public.quiz_questions (quiz_id, question_id, display_order, points)
        VALUES (v_quiz_id, v_question.id, v_count, v_question.points);
    END LOOP;

    UPDATE public.quizzes
    SET total_questions = v_count,
        total_points = (SELECT COALESCE(SUM(points), 0) FROM public.quiz_questions WHERE quiz_id = v_quiz_id)
    WHERE id = v_quiz_id;

    RETURN v_quiz_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- SUBMIT QUIZ ATTEMPT (score calculation and feedback)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
    p_attempt_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_quiz_id UUID;
    v_user_id UUID;
    v_score DECIMAL(5,2) := 0;
    v_total DECIMAL(5,2) := 0;
    v_correct INT := 0;
    v_incorrect INT := 0;
    v_unanswered INT := 0;
    v_percentage DECIMAL(5,2);
    v_time_seconds INT;
    v_quiz_info RECORD;
    v_answer RECORD;
    v_xp INT;
    v_xp_result JSONB;
    v_result JSONB;
BEGIN
    SELECT quiz_id, user_id INTO v_quiz_id, v_user_id
    FROM public.quiz_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attempt not found or already completed';
    END IF;

    FOR v_answer IN
        SELECT ua.question_id, ua.selected_option_id, ua.text_answer,
               ua.is_correct, ua.marks_obtained,
               qo.is_correct AS correct_option,
               q.question_type, q.explanation,
               qq.points
        FROM public.user_answers ua
        JOIN public.quiz_questions qq ON ua.question_id = qq.question_id AND qq.quiz_id = v_quiz_id
        JOIN public.questions q ON ua.question_id = q.id
        LEFT JOIN public.question_options qo ON ua.selected_option_id = qo.id
        WHERE ua.attempt_id = p_attempt_id
    LOOP
        v_total := v_total + v_answer.points;

        IF v_answer.question_type IN ('mcq', 'true_false') THEN
            IF v_answer.selected_option_id IS NOT NULL AND v_answer.correct_option THEN
                v_score := v_score + v_answer.points;
                v_correct := v_correct + 1;
                UPDATE public.user_answers
                SET is_correct = true, marks_obtained = v_answer.points
                WHERE attempt_id = p_attempt_id AND question_id = v_answer.question_id;
            ELSIF v_answer.selected_option_id IS NOT NULL THEN
                v_incorrect := v_incorrect + 1;
                UPDATE public.user_answers
                SET is_correct = false, marks_obtained = 0
                WHERE attempt_id = p_attempt_id AND question_id = v_answer.question_id;
            ELSE
                v_unanswered := v_unanswered + 1;
            END IF;
        ELSE
            IF v_answer.marks_obtained IS NOT NULL THEN
                v_score := v_score + v_answer.marks_obtained;
                IF v_answer.marks_obtained > 0 THEN
                    v_correct := v_correct + 1;
                ELSE
                    v_incorrect := v_incorrect + 1;
                END IF;
            ELSE
                v_unanswered := v_unanswered + 1;
            END IF;
        END IF;
    END LOOP;

    v_percentage := CASE WHEN v_total > 0 THEN ROUND((v_score / v_total) * 100, 2) ELSE 0 END;

    v_time_seconds := EXTRACT(EPOCH FROM (NOW() - (SELECT started_at FROM public.quiz_attempts WHERE id = p_attempt_id)))::INT;

    v_xp := ROUND(v_score::DECIMAL * 2 + GREATEST(0, (v_correct - v_incorrect) * 5));
    v_xp := LEAST(v_xp, 200);

    UPDATE public.quiz_attempts
    SET completed_at = NOW(),
        score = v_score,
        total_possible = v_total,
        percentage = v_percentage,
        correct_count = v_correct,
        incorrect_count = v_incorrect,
        unanswered_count = v_unanswered,
        status = 'completed',
        time_taken_seconds = v_time_seconds,
        xp_earned = v_xp
    WHERE id = p_attempt_id;

    v_xp_result := public.add_xp(
        v_user_id, v_xp, 'quiz_completed',
        'quiz_attempt', p_attempt_id,
        jsonb_build_object('score', v_percentage, 'correct', v_correct, 'total', v_correct + v_incorrect)
    );

    SELECT * INTO v_quiz_info FROM public.quizzes WHERE id = v_quiz_id;

    v_result := jsonb_build_object(
        'attempt_id', p_attempt_id,
        'score', v_score,
        'total_possible', v_total,
        'percentage', v_percentage,
        'correct', v_correct,
        'incorrect', v_incorrect,
        'unanswered', v_unanswered,
        'time_taken_seconds', v_time_seconds,
        'xp_earned', v_xp,
        'passed', v_percentage >= COALESCE(v_quiz_info.passing_percentage, 40),
        'level_up', (v_xp_result ->> 'leveled_up')::boolean
    );

    RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- GET WEAK TOPICS FOR REVISION
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_weak_topics(
    p_user_id UUID,
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    topic_id UUID,
    topic_name TEXT,
    chapter_name TEXT,
    subject_name TEXT,
    weakness_score DECIMAL(5,2),
    mastery_level INT,
    last_studied TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        wa.topic_id,
        t.name AS topic_name,
        c.name AS chapter_name,
        s.name AS subject_name,
        wa.weakness_score,
        COALESCE(ms.mastery_level, 0) AS mastery_level,
        MAX(ss.ended_at) AS last_studied
    FROM public.weak_areas wa
    JOIN public.topics t ON wa.topic_id = t.id
    JOIN public.chapters c ON t.chapter_id = c.id
    JOIN public.subjects s ON wa.subject_id = s.id
    LEFT JOIN public.mastery_snapshots ms ON ms.topic_id = wa.topic_id AND ms.user_id = p_user_id
    LEFT JOIN public.study_sessions ss ON ss.topic_id = wa.topic_id AND ss.user_id = p_user_id
    WHERE wa.user_id = p_user_id AND wa.is_resolved = false
    GROUP BY wa.topic_id, t.name, c.name, s.name, wa.weakness_score, ms.mastery_level
    ORDER BY wa.weakness_score DESC, last_studied ASC NULLS FIRST
    LIMIT p_limit;
END;
$$;
