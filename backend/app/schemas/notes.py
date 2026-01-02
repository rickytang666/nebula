from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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
