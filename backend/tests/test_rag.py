import pytest
import os
import shutil
from app.services.rag.chunker import Chunker
from app.services.rag.document_processor import DocumentProcessor
from app.services.rag.vector_store import VectorStore

def test_chunker_splitting():
    """Test that text is chunked into correct size with overlap."""
    text = "Word1 " * 1000 # 1000 words
    chunker = Chunker(chunk_size=100, chunk_overlap=20)
    chunks = chunker.split_text(text)
    
    assert len(chunks) > 0
    # Every chunk should have approximately 100 words (excluding newline boundaries)
    first_chunk_word_count = chunks[0]["metadata"]["word_count"]
    assert 90 <= first_chunk_word_count <= 105
    
    # Check overlap calculation logic
    # Chunk 1: index 0 to 100
    # Chunk 2: index (100 - 20) = 80 to 180
    assert chunks[1]["metadata"]["start_word_index"] == 80

def test_document_processor_txt(tmp_path):
    """Test extracting text from TXT file."""
    test_file = tmp_path / "test.txt"
    content = "Hello PrepPilot! This is a test file contents."
    test_file.write_text(content, encoding="utf-8")
    
    extracted = DocumentProcessor.extract_text(str(test_file), "txt")
    assert extracted == content

def test_vector_store_addition(tmp_path):
    """Test that VectorStore initializes and handles collection drop and add."""
    # Use temporary folder for Chroma
    chroma_dir = tmp_path / "chroma_test"
    os.environ["CHROMA_PERSIST_DIR"] = str(chroma_dir)
    
    # Lazy imports/settings update is handled in app.config, we can just instantiate
    from app.services.rag.vector_store import VectorStore
    vs = VectorStore()
    
    doc_id = "test-doc-uuid"
    filename = "test.txt"
    chunks = [
        {"text": "Artificial Intelligence is changing the world.", "metadata": {}},
        {"text": "Retrieval Augmented Generation grounding helps prevent hallucination.", "metadata": {}}
    ]
    embeddings = [
        [0.1] * 384,
        [0.5] * 384
    ]
    
    # Add chunks
    vs.add_chunks(doc_id, chunks, embeddings, filename)
    
    # Query similarity
    results = vs.query_similarity(doc_id, [0.11] * 384, top_k=1)
    assert len(results) == 1
    assert "Artificial Intelligence" in results[0]["text_snippet"]
    
    # Cleanup collection
    vs.delete_collection(doc_id)
    
    # Try querying deleted collection
    results_after_delete = vs.query_similarity(doc_id, [0.11] * 384, top_k=1)
    assert len(results_after_delete) == 0
