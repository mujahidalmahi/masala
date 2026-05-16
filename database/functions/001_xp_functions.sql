-- ============================================================================
-- StudySprint OS - XP & Level Functions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CALCULATE XP FOR STUDY SESSION
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_session_xp(
    p_duration_minutes INT,
    p_session_type TEXT
)
RETURNS INT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_xp INT;
BEGIN
    v_xp := p_duration_minutes * 10;

    IF p_session_type = 'quiz' THEN
        v_xp := v_xp + (p_duration_minutes * 5);
    ELSIF p_session_type = 'revision' THEN
        v_xp := v_xp + (p_duration_minutes * 3);
    END IF;

    RETURN LEAST(v_xp, 500);
END;
$$;

-- ---------------------------------------------------------------------------
-- ADD XP TO USER (with level-up check)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_xp(
    p_user_id UUID,
    p_amount INT,
    p_reason TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_current_xp BIGINT;
    v_new_xp BIGINT;
    v_current_level INT;
    v_new_level INT;
    v_max_level INT;
    v_result JSONB;
BEGIN
    SELECT xp_total, level_id INTO v_current_xp, v_current_level
    FROM public.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_new_xp := v_current_xp + p_amount;

    SELECT COALESCE(MAX(id), 1) INTO v_max_level FROM public.levels;

    v_new_level := v_current_level;
    FOR lvl IN v_current_level..v_max_level LOOP
        IF EXISTS (SELECT 1 FROM public.levels WHERE id = lvl AND xp_required <= v_new_xp) THEN
            v_new_level := lvl;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    UPDATE public.profiles
    SET xp_total = v_new_xp,
        level_id = v_new_level
    WHERE id = p_user_id;

    INSERT INTO public.xp_transactions (
        user_id, amount, balance_after, reason,
        reference_type, reference_id, metadata
    ) VALUES (
        p_user_id, p_amount, v_new_xp, p_reason,
        p_reference_type, p_reference_id, p_metadata
    );

    v_result := jsonb_build_object(
        'xp_added', p_amount,
        'xp_total', v_new_xp,
        'previous_level', v_current_level,
        'new_level', v_new_level,
        'leveled_up', v_new_level > v_current_level
    );

    RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- GET NEXT LEVEL INFO
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_next_level_info(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_current_xp BIGINT;
    v_current_level INT;
    v_next_level RECORD;
    v_result JSONB;
BEGIN
    SELECT xp_total, level_id INTO v_current_xp, v_current_level
    FROM public.profiles
    WHERE id = p_user_id;

    SELECT * INTO v_next_level
    FROM public.levels
    WHERE id = v_current_level + 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'current_level', v_current_level,
            'current_xp', v_current_xp,
            'is_max_level', true
        );
    END IF;

    v_result := jsonb_build_object(
        'current_level', v_current_level,
        'current_xp', v_current_xp,
        'next_level', v_next_level.id,
        'xp_needed', v_next_level.xp_required - v_current_xp,
        'xp_required', v_next_level.xp_required,
        'is_max_level', false
    );

    RETURN v_result;
END;
$$;
