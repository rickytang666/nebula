CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TRIGGER IF EXISTS notes_set_updated_at ON public.notes;
DROP FUNCTION IF EXISTS public.set_current_timestamp_on_update();
DROP TABLE IF EXISTS public.notes;

-- notes table references auth.users directly
-- if you need extra user data later, create a profiles table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  basic_stats JSONB
);

CREATE FUNCTION public.set_current_timestamp_on_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_set_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_on_update();
