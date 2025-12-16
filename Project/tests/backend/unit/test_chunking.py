import pytest
from app.core.chunking import TextChunker, prepare_chunks_for_embedding

def test_chunker_initialization():
    chunker = TextChunker(chunk_size=500, overlap=50)
    assert chunker.chunk_size == 500
    assert chunker.overlap == 50
    assert chunker.separator == "\n\n"

def test_chunk_text_empty():
    chunker = TextChunker()
    assert chunker.chunk_text("") == []
    assert chunker.chunk_text("   ") == []
    assert chunker.chunk_text(None) == []

def test_chunk_text_short():
    chunker = TextChunker(chunk_size=100)
    text = "Short text."
    chunks = chunker.chunk_text(text)
    assert len(chunks) == 1
    assert chunks[0]["content"] == "Short text."
    assert chunks[0]["chunk_index"] == 0
    assert chunks[0]["total_chunks"] == 1

def test_chunk_text_split_separator():
    # chunk_size=10 forces split even for small words if combined they exceed it?
    # Actually logic splits by separator if total > chunk_size.
    chunker = TextChunker(chunk_size=10, overlap=0, separator="|")
    text = "AAAAA|BBBBB|CCCCC"
    # "AAAAA|BBBBB" is 11 chars > 10. So it should split.
    # Logic: loops parts. 
    # part AAAAA (5). current=AAAAA.
    # part BBBBB (5). len(current)+len(|)+len(part) = 5+1+5 = 11 > 10.
    # So AAAAA is added. current=BBBBB.
    # part CCCCC (5). 5+1+5 = 11 > 10.
    # So BBBBB is added. current=CCCCC.
    # End loop. Add CCCCC.
    # Total 3 chunks.
    chunks = chunker.chunk_text(text)
    assert len(chunks) == 3
    assert chunks[0]["content"] == "AAAAA"
    assert chunks[1]["content"] == "BBBBB"
    assert chunks[2]["content"] == "CCCCC"

def test_chunk_text_split_sentences():
    # If separators don't do it, sentence splitting kicks in for chunks > chunk_size
    chunker = TextChunker(chunk_size=20, overlap=0)
    # "Sentence one." (13)
    # "Sentence two." (13)
    # Combined > 20.
    text = "Sentence one. Sentence two."
    chunks = chunker.chunk_text(text)
    # Note: Logic splits by separator first (\n\n default). Text has none.
    # So it gets 1 chunk "Sentence one. Sentence two."
    # len is ~27 > 20.
    # _split_by_sentences called on it.
    assert len(chunks) >= 2
    assert "Sentence one." in chunks[0]["content"]

def test_chunk_overlap():
    chunker = TextChunker(chunk_size=10, overlap=2, separator="|")
    text = "AAAAA|BBBBB"
    # Split into AAAAA and BBBBB.
    # Overlap 2 chars from AAAAA -> "AA"
    # 2nd chunk should be "AA BBBBB" -> "AA BBBBB" len 8.
    chunks = chunker.chunk_text(text)
    assert len(chunks) == 2
    assert chunks[0]["content"] == "AAAAA"
    assert chunks[1]["content"] == "AA BBBBB"

def test_prepare_chunks_helper():
    chunks = prepare_chunks_for_embedding("test", chunk_size=100)
    assert len(chunks) == 1
    assert chunks[0]["content"] == "test"
