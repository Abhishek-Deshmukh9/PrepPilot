from typing import List, Dict, Any, Optional
from app.services.rag.embeddings import EmbeddingService
from app.services.rag.vector_store import VectorStore
import logging

logger = logging.getLogger(__name__)

class Retriever:
    def __init__(self, embedding_service: EmbeddingService, vector_store: VectorStore):
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    def retrieve_context(
        self, 
        document_id: str, 
        question: str, 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generates query embedding, performs vector similarity search, 
        and returns Top-K matched chunks with metadata citations.
        """
        logger.info(f"Retrieving context for document {document_id}, question: '{question[:30]}...'")
        
        # 1. Embed query question
        query_embedding = self.embedding_service.get_embedding(question)
        
        # 2. Query similarity from vector store
        results = self.vector_store.query_similarity(
            document_id=document_id,
            query_embedding=query_embedding,
            top_k=top_k
        )
        
        logger.info(f"Retrieved {len(results)} chunks from Vector Database.")
        return results
