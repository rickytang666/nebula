from pydantic import ValidationError
import pytest
from app.routes.notes import NoteCreate, NoteUpdate, NoteResponse
from app.routes.users import UserResponse
from datetime import datetime

def test_note_create_valid():
    """Test creating a valid NoteCreate model."""
    data = {"title": "Test Title", "content": "Test Content"}
    note = NoteCreate(**data)
    assert note.title == "Test Title"
    assert note.content == "Test Content"
    assert note.basic_stats is None

def test_note_create_missing_content():
    """Test that content is required for NoteCreate."""
    data = {"title": "Test Title"}
    with pytest.raises(ValidationError):
        NoteCreate(**data)

def test_note_create_optional_title():
    """Test that title is optional for NoteCreate."""
    data = {"content": "Test Content"}
    note = NoteCreate(**data)
    assert note.title is None
    assert note.content == "Test Content"

def test_note_update_partial():
    """Test invalid partial updates for NoteUpdate."""
    data = {"title": "New Title"}
    note = NoteUpdate(**data)
    assert note.title == "New Title"
    assert note.content is None

def test_user_response_valid():
    """Test valid UserResponse model."""
    data = {"id": "123", "email": "test@example.com"}
    user = UserResponse(**data)
    assert user.id == "123"
    assert user.email == "test@example.com"
