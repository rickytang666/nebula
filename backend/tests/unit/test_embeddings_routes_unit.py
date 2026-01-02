import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.routes.embeddings import embed_note
from app.schemas.embeddings import EmbeddingResponse

@pytest.mark.asyncio
async def test_embed_note_success():
    # Mock dependencies
    note_id = "n1"
    user_id = "u1"
    current_user = {"id": user_id}
    
    mock_supabase = MagicMock()
    # Mock note fetch - success
    mock_db_note = {"id": note_id, "user_id": user_id, "title": "T", "content": "C"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = mock_db_note
    
    # Patch EmbeddingService.embed_note
    with patch("app.services.embeddings.EmbeddingService.embed_note") as mock_service_embed:
        # Mock what the service returns (list of chunks)
        mock_service_embed.return_value = [{"chunk": 1}]
        
        response = await embed_note(note_id, 1000, current_user, mock_supabase)
        
        # Assertions
        assert isinstance(response, EmbeddingResponse)
        assert response.chunks_created == 1
        assert response.note_id == note_id
        
        mock_service_embed.assert_called_once_with(
            supabase=mock_supabase,
            user_id=user_id,
            note_id=note_id,
            title="T",
            content="C",
            chunk_size=1000
        )

@pytest.mark.asyncio
async def test_embed_note_forbidden():
    mock_supabase = MagicMock()
    # Note owned by someone else
    mock_db_note = {"id": "n1", "user_id": "other", "title": "T", "content": "C"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = mock_db_note
    
    with pytest.raises(HTTPException) as exc:
        await embed_note("n1", 1000, {"id": "me"}, mock_supabase) 
    assert exc.value.status_code == 403
