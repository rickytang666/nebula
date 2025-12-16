import pytest
from unittest.mock import MagicMock, patch
from app.routes.profiles import create_profile, get_current_user_profile, update_current_user_profile, ProfileCreate, ProfileUpdate

@pytest.mark.asyncio
async def test_create_profile_success():
    mock_supabase = MagicMock()
    # Mock insert response
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{
        "id": "u1", "full_name": "John", "created_at": "now", "updated_at": "now"
    }]
    
    current_user = {"id": "u1"}
    profile_data = ProfileCreate(full_name="John")
    
    result = await create_profile(profile_data, current_user, mock_supabase)
    assert result["id"] == "u1"
    assert result["full_name"] == "John"

@pytest.mark.asyncio
async def test_get_profile_success():
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
         "id": "u1", "full_name": "John", "created_at": "now", "updated_at": "now"
    }
    
    result = await get_current_user_profile({"id": "u1"}, mock_supabase)
    assert result["id"] == "u1"

@pytest.mark.asyncio
async def test_update_profile_success():
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{
         "id": "u1", "full_name": "John Doe", "created_at": "now", "updated_at": "now"
    }]
    
    update_data = ProfileUpdate(full_name="John Doe")
    result = await update_current_user_profile(update_data, {"id": "u1"}, mock_supabase)
    assert result["full_name"] == "John Doe"
