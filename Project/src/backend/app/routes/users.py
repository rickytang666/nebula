from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.core.database import get_connection

router = APIRouter(prefix="/user", tags=["user"])

# ---------------------------
# Models
# ---------------------------

'''
class editUserInfoRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    profile_data: list | None = None
'''

# ---------------------------
# Routes
# -----------------
