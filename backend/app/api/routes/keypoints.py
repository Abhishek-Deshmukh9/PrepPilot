from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import os
import logging

from app.config import get_settings
from app.database.base import get_db
from app.api.deps import get_gemini_client
from app.models.document import Document
from app.services.rag.document_processor import DocumentProcessor
from app.services.llm.gemini_client import GeminiClient

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()

class KeyPointsRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to extract key points from")

class KeyPointsCategory(BaseModel):
    category: str
    points: List[str]

class KeyPointsResponse(BaseModel):
    document_id: str
    keypoints: List[KeyPointsCategory]

@router.post("/", response_model=KeyPointsResponse)
async def extract_document_keypoints(
    request: KeyPointsRequest,
    db: AsyncSession = Depends(get_db),
    gemini_client: GeminiClient = Depends(get_gemini_client)
):
    """
    Extract structured key points (concepts, definitions, formulas, facts, exam tips)
    from a document. Uses Gemini AI to parse the document text.
    """
    doc = await db.get(Document, request.document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # 1. Fetch file path and extract text
    file_ext = f".{doc.file_type}"
    file_path = os.path.join(settings.upload_dir, f"{doc.id}{file_ext}")
    if not os.path.exists(file_path):
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on disk"
        )
         
    try:
        text = DocumentProcessor.extract_text(file_path, doc.file_type)
    except Exception as e:
        logger.error(f"Error extracting text for key points: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read document text"
        )

    # 2. Query Gemini client to extract keypoints
    try:
        keypoints_data = await gemini_client.extract_keypoints(text)
        
        # Format response
        categories = []
        for cat in keypoints_data:
             categories.append(
                 KeyPointsCategory(
                     category=cat.get("category", "General"),
                     points=cat.get("points", [])
                 )
             )
             
        return KeyPointsResponse(
            document_id=request.document_id,
            keypoints=categories
        )
    except Exception as e:
        logger.error(f"Gemini key points extraction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate key points: {str(e)}"
        )
