CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TRIGGER IF EXISTS notes_set_updated_at ON public.notes;
DROP FUNCTION IF EXISTS public.set_current_timestamp_on_update();
DROP TABLE IF EXISTS public.notes;

-- notes table references auth.users directly
-- if you need extra user data later, create a profiles table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  basic_stats JSONB
);

CREATE FUNCTION public.set_current_timestamp_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER notes_set_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_on_update();

/*
 * ---------------------------
 * PROFILES TABLE
 * ---------------------------
 * Stores public-facing user data.
 */

-- 1. Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add an update trigger for profiles' updated_at timestamp
-- (This uses the same function defined for the notes table)
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_on_update();

/*
 * ---------------------------
 * ROW LEVEL SECURITY (RLS)
 * ---------------------------
 */

-- 3. Enable RLS for the new profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies for profiles
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile."
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 5. Enable RLS for the existing notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS policy for notes
CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);