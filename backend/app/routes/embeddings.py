"""
API routes for handling embeddings and vector search.
Provides endpoints for embedding notes, storing chunks, and semantic search.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client

from app.core.auth import get_current_user, get_authenticated_client
from app.services.embeddings import EmbeddingService
from app.schemas.embeddings import (
    EmbeddingResponse,
    VectorSearchRequest,
    VectorSearchResponse
)

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


# ---------------------------
# Routes
# ---------------------------

@router.post("/embed-note/{note_id}", response_model=EmbeddingResponse)
async def embed_note(
    note_id: str,
    chunk_size: int = Query(1000, ge=500, le=3000),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Create and store embeddings for a note using semantic chunking.
    """
    try:
        # Fetch the note to verify existence/permissions
        response = supabase.table("notes").select("*").eq("id", note_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
        note = response.data
        if note["user_id"] != current_user["id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
            
        embedded_chunks = EmbeddingService.embed_note(
            supabase=supabase,
            user_id=current_user["id"],
            note_id=note_id,
            title=note.get("title", ""),
            content=note["content"],
            chunk_size=chunk_size
        )
        
        return EmbeddingResponse(
            note_id=note_id,
            chunks_created=len(embedded_chunks),
            message=f"Successfully created embeddings for {len(embedded_chunks)} chunks"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create embeddings: {str(e)}"
        )


@router.post("/search", response_model=VectorSearchResponse)
async def vector_search(
    search_request: VectorSearchRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Search note chunks using vector similarity (semantic search).
    """
    try:
        search_results = EmbeddingService.vector_search(
            supabase=supabase,
            user_id=current_user["id"],
            query=search_request.query,
            limit=search_request.limit
        )
        
        return VectorSearchResponse(
            results=search_results,
            count=len(search_results)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vector search failed: {str(e)}"
        )


@router.post("/embed-all")
async def embed_all_notes(
    chunk_size: int = Query(1000, ge=500, le=3000),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Create embeddings for all of a user's notes.
    """
    try:
        result = EmbeddingService.embed_all_notes(
            supabase=supabase,
            user_id=current_user["id"],
            chunk_size=chunk_size
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        # Log error but return 500
        print(f"[Embed-All] FATAL ERROR: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch embedding failed: {str(e)}"
        )


@router.get("/note/{note_id}/chunks")
async def get_note_chunks(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Get all chunks for a specific note.
    
    Returns:
        dict: List of chunks with their metadata
    """
    try:
        # Verify note ownership
        note_response = supabase.table("notes").select("user_id").eq(
            "id", note_id
        ).single().execute()
        
        if not note_response.data or note_response.data["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this note"
            )
        
        # Fetch chunks
        chunks_response = supabase.table("note_chunks").select("*").eq(
            "note_id", note_id
        ).order("chunk_index", desc=False).execute()
        
        chunks = chunks_response.data or []
        
        return {
            "note_id": note_id,
            "total_chunks": len(chunks),
            "chunks": [
                {
                    "chunk_id": chunk["id"],
                    "chunk_index": chunk["chunk_index"],
                    "content": chunk["content"]
                }
                for chunk in chunks
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch chunks: {str(e)}"
        )
