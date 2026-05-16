-- ============================================================================
-- StudySprint OS - Leaderboard & Prediction Functions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- GET LEADERBOARD (by XP or streak)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0,
    p_sort_by TEXT DEFAULT 'xp'
)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    xp_total BIGINT,
    level_id INT,
    current_streak INT,
    longest_streak INT,
    total_study_minutes BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF p_sort_by = 'xp' THEN
        RETURN QUERY
        SELECT
            ROW_NUMBER() OVER (ORDER BY p.xp_total DESC) AS rank,
            p.id,
            p.username,
            p.display_name,
            p.avatar_url,
            p.xp_total,
            p.level_id,
            p.current_streak,
            p.longest_streak,
            COALESCE(SUM(ss.duration_minutes), 0) AS total_study_minutes
        FROM public.profiles p
        LEFT JOIN public.study_sessions ss ON ss.user_id = p.id
        GROUP BY p.id
        ORDER BY p.xp_total DESC
        LIMIT p_limit OFFSET p_offset;
    ELSE
        RETURN QUERY
        SELECT
            ROW_NUMBER() OVER (ORDER BY p.current_streak DESC) AS rank,
            p.id,
            p.username,
            p.display_name,
            p.avatar_url,
            p.xp_total,
            p.level_id,
            p.current_streak,
            p.longest_streak,
            COALESCE(SUM(ss.duration_minutes), 0) AS total_study_minutes
        FROM public.profiles p
        LEFT JOIN public.study_sessions ss ON ss.user_id = p.id
        GROUP BY p.id
        ORDER BY p.current_streak DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- GET USER RANK
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_rank BIGINT;
    v_total_users BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM public.profiles;

    SELECT ranked.rank INTO v_rank
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY xp_total DESC) AS rank
        FROM public.profiles
    ) ranked
    WHERE ranked.id = p_user_id;

    RETURN jsonb_build_object(
        'rank', v_rank,
        'total_users', v_total_users,
        'percentile', CASE WHEN v_total_users > 0 THEN ROUND((1.0 - (v_rank::DECIMAL / v_total_users)) * 100, 1) ELSE 0 END
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- GENERATE PREDICTION (simplified scoring prediction)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_performance_prediction(
    p_user_id UUID,
    p_subject_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_avg_quiz_score DECIMAL(5,2);
    v_study_consistency DECIMAL(5,2);
    v_total_study_minutes INT;
    v_predicted_score DECIMAL(5,2);
    v_confidence DECIMAL(5,2);
    v_factors JSONB;
    v_recommendations JSONB;
    v_prediction_id UUID;
BEGIN
    SELECT
        COALESCE(AVG(qa.percentage), 0),
        COALESCE(SUM(ss.duration_minutes), 0)
    INTO v_avg_quiz_score, v_total_study_minutes
    FROM public.profiles p
    LEFT JOIN public.quiz_attempts qa ON qa.user_id = p.id AND qa.status = 'completed'
        AND (p_subject_id IS NULL OR qa.quiz_id IN (SELECT id FROM public.quizzes WHERE subject_id = p_subject_id))
    LEFT JOIN public.study_sessions ss ON ss.user_id = p.id
        AND (p_subject_id IS NULL OR ss.subject_id = p_subject_id)
    WHERE p.id = p_user_id;

    WITH daily_streak_check AS (
        SELECT
            COUNT(DISTINCT log_date) AS active_days,
            COUNT(DISTINCT CASE WHEN log_date >= CURRENT_DATE - INTERVAL '7 days' THEN log_date END) AS week_days
        FROM public.daily_logs
        WHERE user_id = p_user_id
    )
    SELECT
        CASE WHEN week_days >= 5 THEN 90.0
             WHEN week_days >= 3 THEN 70.0
             WHEN week_days >= 1 THEN 50.0
             ELSE 30.0
        END
    INTO v_study_consistency
    FROM daily_streak_check;

    v_predicted_score := ROUND((v_avg_quiz_score * 0.6 + v_study_consistency * 0.4), 2);
    v_confidence := ROUND(LEAST(95.0, 30.0 + (v_total_study_minutes::DECIMAL / 60) * 5), 2);

    v_factors := jsonb_build_array(
        jsonb_build_object('name', 'Average Quiz Score', 'value', v_avg_quiz_score, 'weight', 0.6),
        jsonb_build_object('name', 'Study Consistency', 'value', v_study_consistency, 'weight', 0.4),
        jsonb_build_object('name', 'Total Study Minutes', 'value', v_total_study_minutes, 'weight', 0.2)
    );

    v_recommendations := jsonb_build_array();
    IF v_avg_quiz_score < 50 THEN
        v_recommendations := v_recommendations || jsonb_build_object(
            'type', 'quiz_practice',
            'message', 'Focus on more quiz practice to improve scores'
        );
    END IF;
    IF v_study_consistency < 70 THEN
        v_recommendations := v_recommendations || jsonb_build_object(
            'type', 'consistency',
            'message', 'Study more consistently - aim for at least 5 days per week'
        );
    END IF;
    IF v_total_study_minutes < 300 THEN
        v_recommendations := v_recommendations || jsonb_build_object(
            'type', 'study_time',
            'message', 'Increase total study time to at least 5 hours per week per subject'
        );
    END IF;

    INSERT INTO public.prediction_results (
        user_id, prediction_type, subject_id,
        predicted_score, confidence, factors, recommendations, input_snapshot
    ) VALUES (
        p_user_id, 'quiz_performance', p_subject_id,
        v_predicted_score, v_confidence, v_factors, v_recommendations,
        jsonb_build_object('avg_quiz_score', v_avg_quiz_score, 'study_consistency', v_study_consistency, 'total_study_minutes', v_total_study_minutes)
    ) RETURNING id INTO v_prediction_id;

    RETURN jsonb_build_object(
        'prediction_id', v_prediction_id,
        'predicted_score', v_predicted_score,
        'confidence', v_confidence,
        'avg_quiz_score', v_avg_quiz_score,
        'study_consistency', v_study_consistency,
        'total_study_minutes', v_total_study_minutes,
        'factors', v_factors,
        'recommendations', v_recommendations
    );
END;
$$;
