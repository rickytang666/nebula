from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, model_validator
from typing import Optional, List, Any
from datetime import datetime
from app.core.auth import get_current_user, get_authenticated_client
from app.core.embeddings import prepare_note_for_embedding, embed_chunks
from supabase import Client

router = APIRouter(prefix="/notes", tags=["notes"])

# ---------------------------
# Models
# ---------------------------

class NoteCreate(BaseModel):
    title: Optional[str] = None
    content: str
    basic_stats: Optional[dict] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    basic_stats: Optional[dict] = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    basic_stats: Optional[dict] = None

# ---------------------------
# Routes
# ---------------------------

@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Get all notes for the current user.
    """
    user_id = current_user["id"]
    
    response = supabase.table("notes").select("*").eq("user_id", user_id).range(skip, skip + limit - 1).order("updated_at", desc=True).execute()
    
    return response.data


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Get a specific note by ID.
    """
    user_id = current_user["id"]
    
    response = supabase.table("notes").select("*").eq("id", note_id).eq("user_id", user_id).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
    return response.data


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Create a new note.
    """
    user_id = current_user["id"]
    
    # Use provided title or derive from content
    title = note.title
    if not title:
        content_lines = note.content.strip().split('\n')
        title = content_lines[0][:100] if content_lines else "Untitled Note"
    
    if not title:
        title = "Untitled Note"
        
    # Store basic_stats (empty for now if not provided)
    basic_stats = note.basic_stats or {}
        
    note_data = {
        "user_id": user_id,
        "title": title,
        "content": note.content,
        "basic_stats": basic_stats
    }
    
    response = supabase.table("notes").insert(note_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Note not created")
        
    created_note = response.data[0]
    
    # Auto-generate embeddings
    try:
        process_embedding_for_note(
            note_id=created_note["id"],
            title=created_note["title"],
            content=created_note["content"],
            user_id=user_id,
            supabase=supabase
        )
    except Exception as e:
        print(f"Error generating embeddings for new note: {e}")
        # Don't fail the request, just log the error
        
    return created_note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note: NoteUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Update an existing note.
    """
    user_id = current_user["id"]
    
    # First get existing note to merge basic_stats if needed
    existing = supabase.table("notes").select("basic_stats").eq("id", note_id).eq("user_id", user_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
    current_stats = existing.data.get('basic_stats') or {}
    
    update_data = note.model_dump(exclude_unset=True)
    
    # Handle basic_stats update if needed (currently just passing through what's sent)
    if 'basic_stats' in update_data:
        # Merge or replace? For now, let's just use what's sent if it's not None
        pass
    
    # If title is not provided but content is, should we auto-update title?
    # Only if title is NOT explicitly provided (which it is in update_data if set).
    # But if frontend sends title, we use it.
    # If frontend sends only content, we might want to keep existing title or update it?
    # Current logic was: if content updated, update title.
    # New logic: if title provided, use it. If not, and content provided, derive it?
    # Let's stick to: if title provided, use it.
    
    if "title" not in update_data and "content" in update_data and update_data["content"]:
         # Optional: derive title if not provided
         # content_lines = update_data["content"].strip().split('\n')
         # title = content_lines[0][:100] if content_lines else "Untitled Note"
         # update_data["title"] = title
         pass
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
        
    response = supabase.table("notes").update(update_data).eq("id", note_id).eq("user_id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or no changes made")
        
    updated_note = response.data[0]
    
    # Auto-update embeddings if content or title changed
    if "content" in update_data or "title" in update_data:
        try:
            process_embedding_for_note(
                note_id=updated_note["id"],
                title=updated_note["title"],
                content=updated_note["content"],
                user_id=user_id,
                supabase=supabase
            )
        except Exception as e:
            print(f"Error updating embeddings: {e}")
            # Don't fail the request
            
    return updated_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Delete a note.
    """
    user_id = current_user["id"]
    
    response = supabase.table("notes").delete().eq("id", note_id).eq("user_id", user_id).execute()
    
    # Supabase delete returns the deleted rows. If empty, it means nothing was deleted (not found or not owned)
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")


@router.get("/search", response_model=List[NoteResponse])
async def search_notes(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Search notes by content.
    """
    user_id = current_user["id"]
    
    # Using 'ilike' for case-insensitive search on content or title
    # Note: This is a simple implementation. For better search, use Full Text Search in Postgres.
    response = supabase.table("notes").select("*").eq("user_id", user_id).or_(f"title.ilike.%{q}%,content.ilike.%{q}%").order("updated_at", desc=True).execute()
    
    return response.data


    return response.data


def process_embedding_for_note(note_id: str, title: str, content: str, user_id: str, supabase: Client):
    """
    Helper function to generate and store embeddings for a note.
    """
    # 1. Chunk the note
    chunks = prepare_note_for_embedding(
        title=title,
        content=content
    )
    
    if not chunks:
        return
        
    # 2. Generate embeddings
    embedded_chunks = embed_chunks(chunks)
    
    # 3. Delete existing chunks
    supabase.table("note_chunks").delete().eq("note_id", note_id).execute()
    
    # 4. Store new chunks
    if embedded_chunks:
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
        
        supabase.table("note_chunks").insert(chunk_records).execute()
