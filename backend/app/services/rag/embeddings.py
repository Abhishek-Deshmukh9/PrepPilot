from google import genai
from app.config import get_settings
from typing import List
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

class EmbeddingService:
    """
    Cloud-native embedding service using Google Gemini's text-embedding-004.
    Requires ZERO local PyTorch / heavy GPU dependencies.
    """
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        
        # Default to Gemini's embedding model
        self.model_name = getattr(settings, "embedding_model", "gemini-embedding-001")
        if not self.model_name or "MiniLM" in self.model_name or "text-embedding" in self.model_name:
            self.model_name = "gemini-embedding-001"

    def _ensure_client(self):
        if not self.client:
            curr_key = settings.gemini_api_key
            if curr_key:
                self.client = genai.Client(api_key=curr_key)
            else:
                raise ValueError("GEMINI_API_KEY is missing. Please set it in backend/.env or your environment.")

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text query using Gemini Cloud Embeddings."""
        self._ensure_client()
        try:
            result = self.client.models.embed_content(
                model=self.model_name,
                contents=text
            )
            if hasattr(result, "embeddings") and result.embeddings:
                return list(result.embeddings[0].values)
            elif hasattr(result, "embedding") and hasattr(result.embedding, "values"):
                return list(result.embedding.values)
            return []
        except Exception as e:
            logger.error(f"Error computing Gemini cloud embedding: {e}")
            raise

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts (batch operation)."""
        if not texts:
            return []
        self._ensure_client()
        try:
            result = self.client.models.embed_content(
                model=self.model_name,
                contents=texts
            )
            if hasattr(result, "embeddings") and result.embeddings:
                return [list(emb.values) for emb in result.embeddings]
            return []
        except Exception as e:
            logger.warning(f"Batch embedding failed ({e}), falling back to individual calls.")
            return [self.get_embedding(t) for t in texts]
