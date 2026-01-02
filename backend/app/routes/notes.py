from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from supabase import Client

from app.core.auth import get_current_user, get_authenticated_client
from app.schemas.notes import NoteCreate, NoteUpdate, NoteResponse
from app.services.embeddings import EmbeddingService

router = APIRouter(prefix="/notes", tags=["notes"])

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
        EmbeddingService.embed_note(
            supabase=supabase,
            user_id=user_id,
            note_id=created_note["id"],
            title=created_note["title"],
            content=created_note["content"]
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
    
    # First get existing note
    existing = supabase.table("notes").select("basic_stats").eq("id", note_id).eq("user_id", user_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        
    update_data = note.model_dump(exclude_unset=True)
    
    # Logic for title derivation if needed (omitted for brevity as per previous implementation logic)
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
        
    response = supabase.table("notes").update(update_data).eq("id", note_id).eq("user_id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or no changes made")
        
    updated_note = response.data[0]
    
    # Auto-update embeddings if content or title changed
    if "content" in update_data or "title" in update_data:
        try:
            EmbeddingService.embed_note(
                supabase=supabase,
                user_id=user_id,
                note_id=updated_note["id"],
                title=updated_note["title"],
                content=updated_note["content"]
            )
        except Exception as e:
            print(f"Error updating embeddings: {e}")
            
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
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")


@router.get("/search", response_model=List[NoteResponse])
async def search_notes(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client)
):
    """
    Search notes by content (simple ILIKE).
    """
    user_id = current_user["id"]
    
    response = supabase.table("notes").select("*").eq("user_id", user_id).or_(f"title.ilike.%{q}%,content.ilike.%{q}%").order("updated_at", desc=True).execute()
    
    return response.data
