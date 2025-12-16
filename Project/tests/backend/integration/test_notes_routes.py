from unittest.mock import MagicMock
import pytest
from app.main import app
from app.core.auth import get_current_user, get_authenticated_client
from fastapi.testclient import TestClient

# Mock User
mock_user = {"id": "test-user-id", "email": "test@example.com"}

# Mock Supabase Client
mock_supabase = MagicMock()

def override_get_current_user():
    return mock_user

def override_get_authenticated_client():
    return mock_supabase

# Override dependencies
app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_authenticated_client] = override_get_authenticated_client

client = TestClient(app)

def test_create_note():
    """Test creating a note via POST /notes/."""
    # Setup mock response for insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{
        "id": "note-123",
        "user_id": "test-user-id",
        "title": "Test Note",
        "content": "This is a test note.",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "basic_stats": {}
    }]

    response = client.post("/notes/", json={"title": "Test Note", "content": "This is a test note."})
    
    # Verify response
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "note-123"
    assert data["title"] == "Test Note"
    
    # Verify mock usage - check that table("notes") was called
    # iterating because table("note_chunks") is also called for embeddings
    calls = [args[0] for args, _ in mock_supabase.table.call_args_list]
    assert "notes" in calls

def test_get_notes():
    """Test retrieving notes via GET /notes/."""
    # Setup mock response for select
    mock_supabase.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value.data = [{
        "id": "note-123",
        "user_id": "test-user-id",
        "title": "Test Note",
        "content": "This is a test note.",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "basic_stats": {}
    }]
    
    response = client.get("/notes/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "note-123"

def test_create_note_no_content():
    """Test validation error when content is missing."""
    response = client.post("/notes/", json={"title": "Empty Note"})
    assert response.status_code == 422
