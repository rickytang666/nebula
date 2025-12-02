"""
Embeddings service for vectorizing note content.
Uses OpenAI's embedding API to create vector representations of text.
Handles chunking for large documents to preserve semantic meaning.
"""

from dotenv import load_dotenv
import os
from typing import List
from openai import OpenAI
from app.core.chunking import prepare_chunks_for_embedding

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
EMBEDDING_MODEL = "text-embedding-3-small"  # Using 1536-dimensional embeddings
EMBEDDING_DIMENSION = 1536

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


def create_embedding(text: str) -> List[float]:
    """
    Create a vector embedding for the given text using OpenAI's API.
    
    Args:
        text: The text to embed (note content)
        
    Returns:
        List[float]: A vector of 1536 dimensions representing the text
        
    Raises:
        ValueError: If OPENAI_API_KEY is not set
        Exception: If the API call fails
    """
    if not OPENAI_API_KEY:
        print("Error: OPENAI_API_KEY is not set in environment variables")
        raise ValueError("OPENAI_API_KEY must be set in environment variables")
    
    if not text or len(text.strip()) == 0:
        raise ValueError("Text cannot be empty")
    
    try:
        response = client.embeddings.create(
            input=text.strip(),
            model=EMBEDDING_MODEL
        )
        
        embedding = response.data[0].embedding
        return embedding
    
    except Exception as e:
        print(f"Error creating embedding: {e}")
        raise Exception(f"Failed to create embedding: {str(e)}")


def create_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Create embeddings for multiple texts in a single API call.
    More efficient than creating embeddings one by one.
    
    Args:
        texts: List of texts to embed
        
    Returns:
        List[List[float]]: List of embedding vectors
        
    Raises:
        ValueError: If OPENAI_API_KEY is not set
        Exception: If the API call fails
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY must be set in environment variables")
    
    if not texts:
        return []
    
    # Filter out empty texts
    valid_texts = [t.strip() for t in texts if t and t.strip()]
    
    if not valid_texts:
        return []
    
    try:
        response = client.embeddings.create(
            input=valid_texts,
            model=EMBEDDING_MODEL
        )
        
        # Sort by index to maintain order
        embeddings = sorted(response.data, key=lambda x: x.index)
        return [item.embedding for item in embeddings]
    
    except Exception as e:
        raise Exception(f"Failed to create embeddings batch: {str(e)}")


def prepare_note_for_embedding(title: str, content: str, chunk_size: int = 1000) -> List[dict]:
    """
    Prepare a note for embedding by chunking it into semantic pieces.
    
    Args:
        title: Note title
        content: Note content
        chunk_size: Size of each chunk in characters
        
    Returns:
        List[dict]: List of chunk dictionaries with content and metadata
    """
    # Combine title and content for better context
    full_text = f"{title}\n\n{content}" if title else content
    
    chunks = prepare_chunks_for_embedding(
        text=full_text,
        title=title,
        chunk_size=chunk_size
    )
    
    return chunks


def embed_chunks(chunks: List[dict]) -> List[dict]:
    """
    Embed multiple chunks and return them with embeddings.
    
    Args:
        chunks: List of chunk dictionaries with 'content' key
        
    Returns:
        List[dict]: Chunks with added 'embedding' key
    """
    if not chunks:
        return []
    
    # Extract content for embedding
    contents = [chunk["content"] for chunk in chunks]
    
    # Get embeddings
    embeddings = create_embeddings_batch(contents)
    
    # Combine chunks with embeddings
    for chunk, embedding in zip(chunks, embeddings):
        chunk["embedding"] = embedding
    
    return chunks
