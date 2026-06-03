from fastapi import Depends
from app.database.base import get_db
from app.services.rag.embeddings import EmbeddingService
from app.services.rag.vector_store import VectorStore
from app.services.rag.retriever import Retriever
from app.services.llm.gemini_client import GeminiClient
from app.services.generators import (
    SummaryGenerator,
    MCQGenerator,
    FlashcardGenerator,
    InterviewGenerator,
    RevisionGenerator
)
from functools import lru_cache

@lru_cache()
def get_embedding_service() -> EmbeddingService:
    """Dependency provider for the embedding service (cached)."""
    return EmbeddingService()

@lru_cache()
def get_vector_store() -> VectorStore:
    """Dependency provider for the ChromaDB vector store (cached)."""
    return VectorStore()

@lru_cache()
def get_gemini_client() -> GeminiClient:
    """Dependency provider for the Gemini client (cached)."""
    return GeminiClient()

def get_retriever(
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    vector_store: VectorStore = Depends(get_vector_store)
) -> Retriever:
    """Dependency provider for the Retriever service."""
    return Retriever(embedding_service, vector_store)

def get_summary_generator(
    gemini_client: GeminiClient = Depends(get_gemini_client)
) -> SummaryGenerator:
    return SummaryGenerator(gemini_client)

def get_mcq_generator(
    gemini_client: GeminiClient = Depends(get_gemini_client)
) -> MCQGenerator:
    return MCQGenerator(gemini_client)

def get_flashcard_generator(
    gemini_client: GeminiClient = Depends(get_gemini_client)
) -> FlashcardGenerator:
    return FlashcardGenerator(gemini_client)

def get_interview_generator(
    gemini_client: GeminiClient = Depends(get_gemini_client)
) -> InterviewGenerator:
    return InterviewGenerator(gemini_client)

def get_revision_generator(
    gemini_client: GeminiClient = Depends(get_gemini_client)
) -> RevisionGenerator:
    return RevisionGenerator(gemini_client)


