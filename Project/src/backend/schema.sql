CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop triggers first (they depend on tables)
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS note_chunks_set_updated_at ON public.note_chunks;
DROP TRIGGER IF EXISTS notes_set_updated_at ON public.notes;

-- Drop function after triggers
DROP FUNCTION IF EXISTS public.set_current_timestamp_on_update();

-- Drop tables last
DROP TABLE IF EXISTS public.note_chunks;
DROP TABLE IF EXISTS public.notes;
DROP TABLE IF EXISTS public.profiles;

-- Create the timestamp function FIRST (before any tables that use it)
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

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  basic_stats JSONB
);

-- Create note_chunks table for storing embeddings of chunks
CREATE TABLE public.note_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  total_chunks INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX note_chunks_note_id_idx ON public.note_chunks(note_id);
CREATE INDEX note_chunks_user_id_idx ON public.note_chunks(user_id);
CREATE INDEX note_chunks_embedding_idx ON public.note_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create trigger for notes
CREATE TRIGGER notes_set_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_on_update();

-- Create trigger for note_chunks
CREATE TRIGGER note_chunks_set_updated_at
BEFORE UPDATE ON public.note_chunks
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_on_update();

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for profiles
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_on_update();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
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

-- RLS policies for notes
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

-- RLS policies for note_chunks
CREATE POLICY "Users can view their own note chunks"
  ON public.note_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note chunks"
  ON public.note_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note chunks"
  ON public.note_chunks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note chunks"
  ON public.note_chunks FOR DELETE
  USING (auth.uid() = user_id);