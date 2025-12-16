from unittest.mock import MagicMock
from app.main import app
from app.core.auth import get_current_user
from fastapi.testclient import TestClient

# Mock User
mock_user = {"id": "test-user-id", "email": "test@example.com"}

def override_get_current_user():
    return mock_user

# Override dependencies
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_get_me():
    """Test GET /users/me returns current user info."""
    response = client.get("/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-user-id"
    assert data["email"] == "test@example.com"
