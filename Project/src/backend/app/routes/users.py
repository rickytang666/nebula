from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_supabase
from app.core.auth import get_current_user
from supabase import Client

router = APIRouter(prefix="/users", tags=["users"])

# ---------------------------
# Models
# ---------------------------

class UserResponse(BaseModel):
    id: str
    email: str
    # Add other fields if profiles table is created later

# ---------------------------
# Routes
# ---------------------------

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    Returns the authenticated user's id and email from the JWT token.
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"]
    )
