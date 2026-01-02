from datetime import datetime
from typing import List, Optional, Dict
from supabase import Client
from fastapi import HTTPException, status

from app.core.embeddings import prepare_note_for_embedding, embed_chunks, create_embedding
from app.schemas.embeddings import EmbeddingResponse, VectorSearchResult, VectorSearchResponse

class EmbeddingService:
    @staticmethod
    def embed_note(
        supabase: Client,
        user_id: str,
        note_id: str,
        title: str,
        content: str,
        chunk_size: int = 1000
    ) -> List[Dict]:
        """
        Embeds a single note.
        """
        # Chunk the note content
        chunks = prepare_note_for_embedding(
            title=title,
            content=content,
            chunk_size=chunk_size
        )
        
        if not chunks:
            return []
        
        # Embed all chunks
        embedded_chunks = embed_chunks(chunks)
        
        # Delete existing chunks for this note
        supabase.table("note_chunks").delete().eq("note_id", note_id).execute()
        
        # Store chunks in database
        chunk_records = [
            {
                "note_id": note_id,
                "user_id": user_id,
                "chunk_index": chunk["chunk_index"],
                "total_chunks": chunk["total_chunks"],
                "content": chunk["content"],
                "embedding": chunk["embedding"]
            }
            for chunk in embedded_chunks
        ]
        
        if chunk_records:
            supabase.table("note_chunks").insert(chunk_records).execute()
            
        return embedded_chunks

    @staticmethod
    def embed_all_notes(
        supabase: Client,
        user_id: str,
        chunk_size: int = 1000
    ) -> Dict:
        """
        Embeds all notes for a user.
        """
        print(f"[Embed-All] Starting embedding generation for user {user_id}")
        
        # Fetch all notes
        response = supabase.table("notes").select("*").eq("user_id", user_id).execute()
        notes = response.data or []
        
        print(f"[Embed-All] Found {len(notes)} notes to process")
        
        total_chunks = 0
        failed_count = 0
        errors = []
        
        for note in notes:
            try:
                # Reuse embed_note logic
                chunks = EmbeddingService.embed_note(
                    supabase=supabase,
                    user_id=user_id,
                    note_id=note["id"],
                    title=note.get("title", ""),
                    content=note["content"],
                    chunk_size=chunk_size
                )
                
                count = len(chunks)
                total_chunks += count
                print(f"[Embed-All] Successfully stored {count} chunks for note {note['id']}")
            
            except Exception as e:
                failed_count += 1
                error_msg = str(e)
                print(f"[Embed-All] ERROR processing note {note['id']}: {error_msg}")
                errors.append({
                    "note_id": note["id"],
                    "error": error_msg
                })
        
        return {
            "total_notes": len(notes),
            "total_chunks": total_chunks,
            "failed_notes": failed_count,
            "errors": errors if errors else None
        }

    @staticmethod
    def vector_search(
        supabase: Client,
        user_id: str,
        query: str,
        limit: int = 10
    ) -> List[VectorSearchResult]:
        """
        Performs semantic search.
        """
        # Create embedding for the search query
        query_embedding = create_embedding(query)
        
        # Perform vector similarity search using RPC
        result = supabase.rpc(
            "search_note_chunks_by_embedding",
            {
                "query_embedding": query_embedding,
                "user_id": user_id,
                "search_limit": limit
            }
        ).execute()
        
        search_results = []
        if result.data:
            for item in result.data:
                search_results.append(
                    VectorSearchResult(
                        chunk_id=item["id"],
                        note_id=item["note_id"],
                        content=item["content"],
                        similarity=float(item["similarity"]),
                        chunk_index=item["chunk_index"],
                        total_chunks=item["total_chunks"]
                    )
                )
        
        return search_results
