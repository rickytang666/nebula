-- Vector similarity search function for note chunks
-- Run this in Supabase SQL Editor after running schema.sql

CREATE OR REPLACE FUNCTION search_note_chunks_by_embedding(
  query_embedding vector(1536),
  user_id UUID,
  search_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  note_id UUID,
  content TEXT,
  similarity FLOAT8,
  chunk_index INT,
  total_chunks INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    note_chunks.id,
    note_chunks.note_id,
    note_chunks.content,
    (1 - (note_chunks.embedding <=> query_embedding)) as similarity,
    note_chunks.chunk_index,
    note_chunks.total_chunks
  FROM public.note_chunks
  WHERE note_chunks.user_id = search_note_chunks_by_embedding.user_id
    AND note_chunks.embedding IS NOT NULL
  ORDER BY note_chunks.embedding <=> query_embedding
  LIMIT search_note_chunks_by_embedding.search_limit;
END;
$$ LANGUAGE plpgsql;
