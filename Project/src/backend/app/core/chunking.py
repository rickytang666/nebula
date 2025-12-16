"""Text chunking service for breaking large documents into semantic chunks."""

import re
from typing import List


class TextChunker:
    """Handles semantic chunking of text while preserving meaning."""
    
    def __init__(
        self,
        chunk_size: int = 1000,
        overlap: int = 200,
        separator: str = "\n\n"
    ):
        """
        Initialize the text chunker.
        
        Args:
            chunk_size: Target size of each chunk in characters
            overlap: Number of overlapping characters between chunks
            separator: Primary separator for splitting (paragraphs)
        """
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.separator = separator
    
    def chunk_text(self, text: str, title: str = "") -> List[dict]:
        """
        Break text into semantic chunks.
        
        Args:
            text: The text to chunk
            title: Optional title to include with each chunk
            
        Returns:
            List of dictionaries with chunk content and metadata
        """
        if not text or len(text.strip()) == 0:
            return []
        
        text = text.strip()
        
        # For very short text (less than chunk_size), just return it as a single chunk
        if len(text) <= self.chunk_size:
            return [{
                "content": text,
                "title": title,
                "chunk_index": 0,
                "total_chunks": 1
            }]
        
        # Start with paragraph-level splits for longer text
        chunks = self._split_by_separator(text, self.separator)
        
        # Further split if chunks are still too large
        final_chunks = []
        for chunk in chunks:
            if len(chunk) > self.chunk_size:
                # Split by sentences if paragraphs are too large
                sub_chunks = self._split_by_sentences(chunk)
                final_chunks.extend(sub_chunks)
            else:
                final_chunks.append(chunk)
        
        # Add overlap between chunks
        overlapped_chunks = self._add_overlap(final_chunks)
        
        # Format with metadata
        formatted_chunks = [
            {
                "content": chunk.strip(),
                "title": title,
                "chunk_index": idx,
                "total_chunks": len(overlapped_chunks)
            }
            for idx, chunk in enumerate(overlapped_chunks)
            if chunk.strip()  # Filter out empty chunks
        ]
        
        # Ensure we always return at least one chunk if text is not empty
        if not formatted_chunks and text:
            formatted_chunks = [{
                "content": text,
                "title": title,
                "chunk_index": 0,
                "total_chunks": 1
            }]
        
        return formatted_chunks
    
    def _split_by_separator(self, text: str, separator: str) -> List[str]:
        """Split text by separator, respecting minimum chunk size."""
        if separator not in text:
            return [text]
        
        parts = text.split(separator)
        chunks = []
        current_chunk = ""
        
        for part in parts:
            if len(current_chunk) + len(part) + len(separator) < self.chunk_size:
                # Add to current chunk
                if current_chunk:
                    current_chunk += separator + part
                else:
                    current_chunk = part
            else:
                # Start new chunk
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = part
        
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks
    
    def _split_by_sentences(self, text: str) -> List[str]:
        """Split text by sentences for finer granularity."""
        # Match sentences ending with . ! ? followed by space or end of text
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) + 1 < self.chunk_size:
                current_chunk += " " + sentence if current_chunk else sentence
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _add_overlap(self, chunks: List[str]) -> List[str]:
        """Add overlapping text between consecutive chunks."""
        if len(chunks) <= 1:
            return chunks
        
        overlapped = [chunks[0]]
        
        for i in range(1, len(chunks)):
            prev_chunk = chunks[i - 1]
            current_chunk = chunks[i]
            
            # Extract overlap from end of previous chunk
            if self.overlap > 0:
                overlap_text = prev_chunk[-self.overlap:] if len(prev_chunk) > self.overlap else prev_chunk
            else:
                overlap_text = ""
            
            # Prepend overlap to current chunk
            combined = overlap_text + " " + current_chunk
            overlapped.append(combined)
        
        return overlapped


def prepare_chunks_for_embedding(text: str, title: str = "", chunk_size: int = 1000) -> List[dict]:
    """
    Convenience function to chunk text for embedding.
    
    Args:
        text: Text to chunk
        title: Optional title
        chunk_size: Size of chunks
        
    Returns:
        List of chunk dictionaries ready for embedding
    """
    chunker = TextChunker(chunk_size=chunk_size)
    return chunker.chunk_text(text, title)
