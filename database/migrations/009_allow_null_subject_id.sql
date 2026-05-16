-- Allow study_sessions.subject_id to be NULL (for general focus sessions without a specific subject)
ALTER TABLE public.study_sessions ALTER COLUMN subject_id DROP NOT NULL;
