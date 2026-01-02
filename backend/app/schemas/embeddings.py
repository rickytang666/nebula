from pydantic import BaseModel
from typing import List

class EmbeddingResponse(BaseModel):
    """Response model for embedding operations."""
    note_id: str
    chunks_created: int
    message: str


class VectorSearchRequest(BaseModel):
    """Request model for vector similarity search."""
    query: str
    limit: int = 10


class VectorSearchResult(BaseModel):
    """Single result from vector search."""
    chunk_id: str
    note_id: str
    content: str
    similarity: float
    chunk_index: int
    total_chunks: int


class VectorSearchResponse(BaseModel):
    """Response model for vector search."""
    results: List[VectorSearchResult]
    count: int
