"""
API routes for handling embeddings and vector search.
Provides endpoints for embedding notes, storing chunks, and semantic search.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import get_supabase
from app.core.auth import get_current_user
from app.core.embeddings import create_embedding, prepare_note_for_embedding, embed_chunks
from supabase import Client

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


# ---------------------------
# Models
# --------------------------

class EmbeddingResponse(BaseModel):
    """Response model for embedding operations."""
    note_id: str
    chunks_created: int
    message: str


class VectorSearchRequest(BaseModel):
    """Request model for vector similarity search."""
    query: str
    limit: int = 10


class VectorSearchResult(BaseModel):
    """Single result from vector search."""
    chunk_id: str
    note_id: str
    content: str
    similarity: float
    chunk_index: int
    total_chunks: int


class VectorSearchResponse(BaseModel):
    """Response model for vector search."""
    results: List[VectorSearchResult]
    count: int


# ---------------------------
# Routes
# ---------------------------

@router.post("/embed-note/{note_id}", response_model=EmbeddingResponse)
async def embed_note(
    note_id: str,
    chunk_size: int = Query(1000, ge=500, le=3000),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Create and store embeddings for a note using semantic chunking.
    
    This endpoint:
    1. Fetches the note from the database
    2. Chunks the content into semantic pieces
    3. Generates embeddings for each chunk using OpenAI
    4. Stores chunks with embeddings in note_chunks table
    
    Args:
        note_id: The ID of the note to embed
        chunk_size: Size of each chunk (500-3000 characters)
        
    Returns:
        EmbeddingResponse: Number of chunks created
        
    Raises:
        HTTPException: 404 if note not found, 401 if unauthorized
    """
    try:
        # Fetch the note
        response = supabase.table("notes").select("*").eq("id", note_id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        note = response.data
        
        # Verify ownership
        if note["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to embed this note"
            )
        
        # Chunk the note content
        chunks = prepare_note_for_embedding(
            title=note.get("title", ""),
            content=note["content"],
            chunk_size=chunk_size
        )
        
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Note content is empty"
            )
        
        # Embed all chunks
        embedded_chunks = embed_chunks(chunks)
        
        # Delete existing chunks for this note
        supabase.table("note_chunks").delete().eq("note_id", note_id).execute()
        
        # Store chunks in database
        chunk_records = [
            {
                "note_id": note_id,
                "user_id": current_user["id"],
                "chunk_index": chunk["chunk_index"],
                "total_chunks": chunk["total_chunks"],
                "content": chunk["content"],
                "embedding": chunk["embedding"]
            }
            for chunk in embedded_chunks
        ]
        
        supabase.table("note_chunks").insert(chunk_records).execute()
        
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
    supabase: Client = Depends(get_supabase)
):
    """
    Search note chunks using vector similarity (semantic search).
    
    This endpoint:
    1. Creates an embedding for the search query
    2. Performs similarity search against all user's note chunks
    3. Returns results ranked by similarity score
    
    Args:
        search_request: Contains the query and limit parameters
        
    Returns:
        VectorSearchResponse: List of matching chunks with similarity scores
    """
    try:
        # Create embedding for the search query
        query_embedding = create_embedding(search_request.query)
        
        # Perform vector similarity search using RPC
        result = supabase.rpc(
            "search_note_chunks_by_embedding",
            {
                "query_embedding": query_embedding,
                "user_id": current_user["id"],
                "limit": search_request.limit
            }
        ).execute()
        
        # Transform results into response model
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
    supabase: Client = Depends(get_supabase)
):
    """
    Create embeddings for all of a user's notes.
    
    Returns:
        dict: Summary of embedding operation
    """
    try:
        # Fetch all notes
        response = supabase.table("notes").select("*").eq(
            "user_id", current_user["id"]
        ).execute()
        
        notes = response.data or []
        total_chunks = 0
        failed_count = 0
        errors = []
        
        # Process each note
        for note in notes:
            try:
                # Chunk the note
                chunks = prepare_note_for_embedding(
                    title=note.get("title", ""),
                    content=note["content"],
                    chunk_size=chunk_size
                )
                
                if not chunks:
                    continue
                
                # Embed chunks
                embedded_chunks = embed_chunks(chunks)
                
                # Delete existing chunks
                supabase.table("note_chunks").delete().eq("note_id", note["id"]).execute()
                
                # Store chunks
                chunk_records = [
                    {
                        "note_id": note["id"],
                        "user_id": current_user["id"],
                        "chunk_index": chunk["chunk_index"],
                        "total_chunks": chunk["total_chunks"],
                        "content": chunk["content"],
                        "embedding": chunk["embedding"]
                    }
                    for chunk in embedded_chunks
                ]
                
                supabase.table("note_chunks").insert(chunk_records).execute()
                total_chunks += len(embedded_chunks)
            
            except Exception as e:
                failed_count += 1
                errors.append({
                    "note_id": note["id"],
                    "error": str(e)
                })
        
        return {
            "total_notes": len(notes),
            "total_chunks": total_chunks,
            "failed_notes": failed_count,
            "errors": errors if errors else None
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch embedding failed: {str(e)}"
        )


@router.get("/note/{note_id}/chunks")
async def get_note_chunks(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
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
