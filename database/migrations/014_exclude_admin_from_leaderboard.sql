-- ============================================================================
-- Fix: admin user appears in leaderboard and user rank calculations.
-- Filter out role='admin' from both functions.
-- ============================================================================

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
        WHERE p.role != 'admin'
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
        WHERE p.role != 'admin'
        GROUP BY p.id
        ORDER BY p.current_streak DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
END;
$$;


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
    SELECT COUNT(*) INTO v_total_users
    FROM public.profiles
    WHERE role != 'admin';

    SELECT ranked.rank INTO v_rank
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY xp_total DESC) AS rank
        FROM public.profiles
        WHERE role != 'admin'
    ) ranked
    WHERE ranked.id = p_user_id;

    RETURN jsonb_build_object(
        'rank', v_rank,
        'total_users', v_total_users,
        'percentile', CASE WHEN v_total_users > 0 THEN ROUND((1.0 - (v_rank::DECIMAL / v_total_users)) * 100, 1) ELSE 0 END
    );
END;
$$;