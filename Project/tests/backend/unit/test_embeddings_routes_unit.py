import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import HTTPException
from app.routes.embeddings import embed_note

@pytest.mark.asyncio
async def test_embed_note_success():
    # Mock dependencies
    note_id = "n1"
    user_id = "u1"
    current_user = {"id": user_id}
    
    mock_supabase = MagicMock()
    mock_db_note = {"id": note_id, "user_id": user_id, "title": "T", "content": "C"}
    
    # Mock Select
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = mock_db_note
    # Mock Delete/Insert
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = None
    mock_supabase.table.return_value.insert.return_value.execute.return_value = None
    
    with patch("app.routes.embeddings.prepare_note_for_embedding") as mock_prep:
        mock_prep.return_value = [{"chunk_index": 0, "total_chunks": 1, "content": "C"}]
        
        with patch("app.routes.embeddings.embed_chunks") as mock_embed:
            mock_embed.return_value = [{"chunk_index": 0, "total_chunks": 1, "content": "C", "embedding": [0.1]}]
            
            response = await embed_note(note_id, 1000, current_user, mock_supabase)
            
            assert response.chunks_created == 1
            assert response.note_id == note_id
            
@pytest.mark.asyncio
async def test_embed_note_forbidden():
    mock_supabase = MagicMock()
    # Note owned by someone else
    mock_db_note = {"id": "n1", "user_id": "other", "title": "T", "content": "C"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = mock_db_note
    
    with pytest.raises(HTTPException) as exc:
        await embed_note("n1", 1000, {"id": "me"}, mock_supabase) 
    assert exc.value.status_code == 403
