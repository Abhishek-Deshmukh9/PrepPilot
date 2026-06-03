import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import get_settings
from typing import List, Dict, Any, Optional
import os
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

class VectorStore:
    def __init__(self):
        self.persist_dir = settings.chroma_persist_dir
        # Ensure persist directory exists
        os.makedirs(self.persist_dir, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB persistent client at: {self.persist_dir}")
        self.client = chromadb.PersistentClient(path=self.persist_dir)

    def _get_collection_name(self, document_id: str) -> str:
        """Chroma collection names must be 3-63 chars, alphanumeric, start/end with alpha, no double dots."""
        # Replace hyphens with underscores, prefix with 'doc_' to ensure starts with letter
        safe_id = document_id.replace("-", "_")
        return f"doc_{safe_id}"

    def get_or_create_collection(self, document_id: str):
        """Get or create collection for a specific document."""
        collection_name = self._get_collection_name(document_id)
        return self.client.get_or_create_collection(name=collection_name)

    def add_chunks(
        self, 
        document_id: str, 
        chunks: List[Dict[str, Any]], 
        embeddings: List[List[float]], 
        filename: str
    ):
        """
        Store chunk texts, IDs, embeddings and metadata in the document's Chroma collection.
        """
        if not chunks or not embeddings:
            return

        collection = self.get_or_create_collection(document_id)
        
        ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        documents = [c["text"] for c in chunks]
        
        metadatas = []
        for i, c in enumerate(chunks):
            metadata = {
                "document_id": document_id,
                "chunk_index": i,
                "filename": filename,
                **c.get("metadata", {})
            }
            # Flatten or serialize nested dictionaries since Chroma metadata only supports simple types
            flat_metadata = {}
            for k, v in metadata.items():
                if isinstance(v, (str, int, float, bool)):
                    flat_metadata[k] = v
                else:
                    flat_metadata[k] = str(v)
            metadatas.append(flat_metadata)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Successfully added {len(chunks)} chunks to collection {collection.name}")

    def query_similarity(
        self, 
        document_id: str, 
        query_embedding: List[float], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Query document collection using embedding and return Top-K matches.
        """
        collection_name = self._get_collection_name(document_id)
        try:
            collection = self.client.get_collection(name=collection_name)
        except Exception:
            logger.warning(f"Collection {collection_name} does not exist. Returning empty results.")
            return []

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        formatted_results = []
        if results and "documents" in results and results["documents"]:
            # Chroma returns a list of lists since it supports batch queries
            docs = results["documents"][0]
            ids = results["ids"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)

            for i in range(len(docs)):
                # Convert distance to similarity score (Chroma uses L2 distance by default, smaller = closer)
                score = 1.0 / (1.0 + distances[i])
                formatted_results.append({
                    "chunk_id": ids[i],
                    "text_snippet": docs[i],
                    "score": float(score),
                    "metadata": metadatas[i]
                })

        return formatted_results

    def delete_collection(self, document_id: str):
        """Delete collection for a specific document (used when document is deleted)."""
        collection_name = self._get_collection_name(document_id)
        try:
            self.client.delete_collection(name=collection_name)
            logger.info(f"Deleted Chroma collection: {collection_name}")
        except Exception as e:
            logger.warning(f"Could not delete collection {collection_name}: {e}")
