import re
from typing import List, Dict, Any

class Chunker:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size # target chunk size in tokens (approx words)
        self.chunk_overlap = chunk_overlap # target overlap in tokens (approx words)

    def split_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Splits text into chunks of roughly `chunk_size` words with `chunk_overlap` words overlap.
        Preserves paragraph and sentence boundaries where possible.
        Returns a list of dictionaries with 'text' and 'metadata'.
        """
        if not text or not text.strip():
            return []

        # Split text into paragraphs first
        paragraphs = text.split("\n\n")
        
        words = []
        for p in paragraphs:
            # Simple word-token split (keeping whitespace structure)
            p_words = p.split()
            if p_words:
                words.extend(p_words)
                words.append("\n\n") # paragraph boundary marker

        chunks = []
        i = 0
        total_words = len(words)
        
        while i < total_words:
            # Determine end of chunk
            end = min(i + self.chunk_size, total_words)
            chunk_words = words[i:end]
            
            # Clean up boundary markers at the end/start of chunks
            chunk_text = " ".join(chunk_words).replace(" \n\n ", "\n\n").replace(" \n\n", "\n\n").replace("\n\n ", "\n\n")
            chunk_text = chunk_text.strip()
            
            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "start_word_index": i,
                        "end_word_index": end,
                        "word_count": len([w for w in chunk_words if w != "\n\n"])
                    }
                })
            
            # Move index forward, subtracting overlap
            if end == total_words:
                break
            i += (self.chunk_size - self.chunk_overlap)
            
            # Safety check to prevent infinite loops if overlap >= size
            if self.chunk_size <= self.chunk_overlap:
                i += self.chunk_size
                
        return chunks
