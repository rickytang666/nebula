import pytest
from unittest.mock import MagicMock, patch
from app.services.embeddings import EmbeddingService

def test_embed_note_success():
    mock_supabase = MagicMock()
    mock_note = {"id": "n1", "title": "T", "content": "C", "user_id": "u1"}
    
    with patch("app.services.embeddings.prepare_note_for_embedding") as mock_prep:
        mock_prep.return_value = [{"chunk": 1}]
        
        with patch("app.services.embeddings.embed_chunks") as mock_embed:
            mock_embed.return_value = [{
                "chunk_index": 0, 
                "total_chunks": 1, 
                "content": "C", 
                "embedding": [0.1]
            }]
            
            mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = None
            mock_supabase.table.return_value.insert.return_value.execute.return_value = None
            
            # Use EmbeddingService.embed_note
            EmbeddingService.embed_note(
                supabase=mock_supabase,
                user_id="u1",
                note_id="n1",
                title="T",
                content="C"
            )
            
            mock_prep.assert_called_once()
            mock_embed.assert_called_once()
