from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import os
import logging
from app.config import get_settings
from app.database.base import get_db
from app.api.deps import get_vector_store
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all uploaded documents."""
    result = await db.execute(select(Document).order_by(Document.upload_date.desc()))
    documents = result.scalars().all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details of a specific document."""
    document = await db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return document

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store)
):
    """
    Delete a document from DB, remove local file from disk, and drop vector store collection.
    """
    document = await db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # 1. Drop vector database collection
    try:
        vector_store.delete_collection(document_id)
    except Exception as e:
        logger.error(f"Error dropping Chroma collection for document {document_id}: {e}")

    # 2. Delete local file from disk
    file_ext = f".{document.file_type}"
    local_file_path = os.path.join(settings.upload_dir, f"{document.id}{file_ext}")
    if os.path.exists(local_file_path):
        try:
            os.remove(local_file_path)
            logger.info(f"Deleted local file from disk: {local_file_path}")
        except Exception as e:
            logger.error(f"Error deleting local file {local_file_path}: {e}")
    else:
        logger.warning(f"Local file {local_file_path} not found during document deletion.")

    # 3. Delete DB record
    try:
        await db.delete(document)
        await db.commit()
    except Exception as e:
        logger.error(f"Error deleting document {document_id} from SQLite DB: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document from metadata database."
        )

    return {"message": "Document and all associated data deleted successfully."}
