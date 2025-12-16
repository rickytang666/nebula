import pytest
from unittest.mock import MagicMock, patch
from app.routes.notes import process_embedding_for_note

def test_process_embedding_for_note_success():
    mock_supabase = MagicMock()
    mock_note = {"id": "n1", "title": "T", "content": "C", "user_id": "u1"}
    
    with patch("app.routes.notes.prepare_note_for_embedding") as mock_prep:
        mock_prep.return_value = [{"chunk": 1}]
        
        with patch("app.routes.notes.embed_chunks") as mock_embed:
            mock_embed.return_value = [{
                "chunk_index": 0, 
                "total_chunks": 1, 
                "content": "C", 
                "embedding": [0.1]
            }]
            
            mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = None
            mock_supabase.table.return_value.insert.return_value.execute.return_value = None
            
            # Correct signature: note_id, title, content, user_id, supabase
            process_embedding_for_note("n1", "T", "C", "u1", mock_supabase)
            
            mock_prep.assert_called_once()
            mock_embed.assert_called_once()
