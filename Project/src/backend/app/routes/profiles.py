from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_supabase_admin
from app.core.auth import get_current_user
from supabase import Client

router = APIRouter(prefix="/profiles", tags=["profiles"])

# ---------------------------
# Models
# ---------------------------

class ProfileResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ProfileCreate(BaseModel):
    # The frontend (signup.tsx) has the name, so it will send it here.
    full_name: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    # Add other updatable fields here later if needed

# ---------------------------
# Routes
# ---------------------------

@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile: ProfileCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Create a new profile for the current authenticated user.
    This should be called by the frontend right after signup.
    """
    user_id = current_user["id"]
    
    profile_data = {
        "id": user_id,
        "full_name": profile.full_name
    }
    
    try:
        response = supabase.table("profiles").insert(profile_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile not created")
            
        return response.data[0]
        
    except Exception as e:
        # Handle potential duplicate creation or other errors
        if "duplicate key" in str(e):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/me", response_model=ProfileResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Get the profile for the currently authenticated user.
    """
    user_id = current_user["id"]
    
    response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        
    return response.data

@router.put("/me", response_model=ProfileResponse)
async def update_current_user_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Update the profile for the currently authenticated user.
    """
    user_id = current_user["id"]
    
    update_data = profile.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
        
    response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found or no changes made")
        
    return response.data[0]