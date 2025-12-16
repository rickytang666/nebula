import pytest
from unittest.mock import MagicMock, patch
from app.core.embeddings import create_embedding, embed_chunks, prepare_note_for_embedding

@pytest.fixture
def mock_openai():
    with patch("app.core.embeddings.client") as mock:
        yield mock

def test_create_embedding(mock_openai):
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2])]
    mock_openai.embeddings.create.return_value = mock_response
    
    emb = create_embedding("test")
    assert emb == [0.1, 0.2]
    mock_openai.embeddings.create.assert_called_once()

def test_embed_chunks(mock_openai):
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2])]
    mock_openai.embeddings.create.return_value = mock_response
    
    chunks = [{"content": "c1"}]
    result = embed_chunks(chunks)
    assert len(result) == 1
    assert result[0]["embedding"] == [0.1, 0.2]

def test_prepare_note_for_embedding():
    # This uses TextChunker, which we already tested, but this wraps it.
    chunks = prepare_note_for_embedding("Title", "Content", 100)
    assert len(chunks) == 1
    assert chunks[0]["title"] == "Title"
