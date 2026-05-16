-- ============================================================================
-- StudySprint OS - Add role column to profiles (run after 001_schema_core)
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data ->> 'avatar_url',
        'user'
    );
    RETURN NEW;
END;
$$;
