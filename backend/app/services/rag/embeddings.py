from sentence_transformers import SentenceTransformer
from app.config import get_settings
from typing import List
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        """Lazy load the sentence-transformers model to save memory/time on startup."""
        if cls._model is None:
            model_name = settings.embedding_model
            logger.info(f"Loading sentence-transformer model: {model_name}...")
            try:
                cls._model = SentenceTransformer(model_name)
                logger.info(f"Model {model_name} loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise RuntimeError(f"Could not load sentence transformer model: {e}")
        return cls._model

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text query."""
        model = self.get_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts (batch operation)."""
        if not texts:
            return []
        model = self.get_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
