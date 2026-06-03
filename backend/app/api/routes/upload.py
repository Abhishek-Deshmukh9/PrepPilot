from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid
import logging
import aiofiles
from app.config import get_settings
from app.database.base import get_db
from app.api.deps import get_embedding_service, get_vector_store
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.rag.document_processor import DocumentProcessor
from app.services.rag.chunker import Chunker
from app.services.rag.embeddings import EmbeddingService
from app.services.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()

# Whitelist allowed extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

async def process_document_task(
    doc_id: str,
    file_path: str,
    filename: str,
    file_type: str,
    file_size: int,
    db_session_factory, # session maker because we are in background task
    embedding_service: EmbeddingService,
    vector_store: VectorStore
):
    """Background task to extract, chunk, embed, and store document in vector DB."""
    async with db_session_factory() as db:
        db_doc = await db.get(Document, doc_id)
        if not db_doc:
            logger.error(f"Document {doc_id} not found in DB during background task.")
            return

        try:
            # Step 1: Extract Text
            logger.info(f"Background task: Extracting text from {file_path}")
            text = DocumentProcessor.extract_text(file_path, file_type)
            if not text.strip():
                raise ValueError("No text could be extracted from document.")

            # Step 2: Chunk Text
            logger.info(f"Background task: Chunking text for {doc_id}")
            chunker = Chunker(chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap)
            chunks = chunker.split_text(text)
            chunk_count = len(chunks)

            # Step 3: Embed & Store in ChromaDB
            if chunk_count > 0:
                logger.info(f"Background task: Generating embeddings for {chunk_count} chunks")
                texts = [c["text"] for c in chunks]
                embeddings = embedding_service.get_embeddings(texts)
                
                logger.info(f"Background task: Adding embeddings to vector store")
                vector_store.add_chunks(
                    document_id=doc_id,
                    chunks=chunks,
                    embeddings=embeddings,
                    filename=filename
                )

            # Step 4: Update document status
            db_doc.chunk_count = chunk_count
            db_doc.status = "ready"
            db_doc.metadata_json = {
                "character_count": len(text),
                "word_count": len(text.split()),
                "processed_successfully": True
            }
            db.add(db_doc)
            await db.commit()
            logger.info(f"Background task: Successfully completed processing document {doc_id}")

        except Exception as e:
            logger.exception(f"Background task failed for document {doc_id}")
            db_doc.status = "error"
            db_doc.metadata_json = {
                "error_message": str(e),
                "processed_successfully": False
            }
            db.add(db_doc)
            await db.commit()

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    vector_store: VectorStore = Depends(get_vector_store)
):
    """
    Upload a document (PDF, DOCX, TXT) and schedule background processing (RAG pipeline ingestion).
    """
    # Validate extension
    filename = file.filename
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Initialize uploads folder
    os.makedirs(settings.upload_dir, exist_ok=True)
    
    doc_id = str(uuid.uuid4())
    save_filename = f"{doc_id}{ext}"
    dest_path = os.path.join(settings.upload_dir, save_filename)

    # Write file content asynchronously
    file_size = 0
    try:
        async with aiofiles.open(dest_path, "wb") as out_file:
            while content := await file.read(1024 * 1024): # 1MB chunks
                file_size += len(content)
                if file_size > settings.max_file_size_bytes:
                    # Clean up
                    await file.close()
                    out_file.close()
                    if os.path.exists(dest_path):
                        os.remove(dest_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.max_file_size_mb}MB"
                    )
                await out_file.write(content)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save file locally: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file."
        )

    # Create Document DB Record
    file_type = ext[1:] # e.g. 'pdf'
    db_doc = Document(
        id=doc_id,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        status="processing"
    )
    db.add(db_doc)
    await db.commit()
    await db.refresh(db_doc)

    # Import Session Maker for background task context safety
    from app.database.base import AsyncSessionLocal

    # Schedule RAG pipeline background execution
    background_tasks.add_task(
        process_document_task,
        doc_id=doc_id,
        file_path=dest_path,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        db_session_factory=AsyncSessionLocal,
        embedding_service=embedding_service,
        vector_store=vector_store
    )

    return db_doc
