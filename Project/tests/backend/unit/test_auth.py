import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.core.auth import get_current_user, get_authenticated_client
from fastapi.security import HTTPAuthorizationCredentials

@pytest.mark.asyncio
async def test_get_current_user_valid():
    # Mock credentials
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid_token")
    
    # Mock Supabase client and response
    mock_user = MagicMock()
    mock_user.id = "user-123"
    mock_user.email = "test@example.com"
    mock_user.aud = "authenticated"
    mock_user.role = "authenticated"
    mock_user.created_at = "2024-01-01T00:00:00Z"
    
    mock_response = MagicMock()
    mock_response.user = mock_user
    
    with patch("app.core.auth.get_supabase") as mock_get_supabase:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_response
        mock_get_supabase.return_value = mock_client
        
        user = await get_current_user(creds)
        
        assert user["id"] == "user-123"
        assert user["email"] == "test@example.com"
        mock_client.auth.get_user.assert_called_with("valid_token")

@pytest.mark.asyncio
async def test_get_current_user_invalid():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_token")
    
    with patch("app.core.auth.get_supabase") as mock_get_supabase:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = None # Invalid token returns None/Error
        mock_get_supabase.return_value = mock_client
        
        with pytest.raises(HTTPException) as exc:
            await get_current_user(creds)
        
        assert exc.value.status_code == 401
        assert "Invalid or expired token" in exc.value.detail

@pytest.mark.asyncio
async def test_get_authenticated_client():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token123")
    
    with patch("app.core.auth.get_supabase") as mock_get_supabase:
        mock_client = MagicMock()
        mock_get_supabase.return_value = mock_client
        
        client = await get_authenticated_client(creds)
        
        assert client == mock_client
        mock_client.postgrest.auth.assert_called_with("token123")
