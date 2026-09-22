from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime
import json
import os
import logging

from app.config import get_settings
from app.database.base import get_db
from app.api.deps import get_gemini_client
from app.models.document import Document
from app.models.generated_content import GeneratedContent
from app.services.rag.document_processor import DocumentProcessor
from app.services.llm.gemini_client import GeminiClient

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()

class KeyPointsRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to extract key points from")
    force_refresh: bool = Field(False, description="Whether to bypass cached key points and re-extract")

class KeyPointsCategory(BaseModel):
    category: str
    points: List[str]

class KeyPointsResponse(BaseModel):
    document_id: str
    keypoints: List[KeyPointsCategory]

@router.get("/{document_id}", response_model=KeyPointsResponse)
async def get_cached_keypoints(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve previously extracted key points for a document if cached.
    """
    cache_query = (
        select(GeneratedContent)
        .where(
            GeneratedContent.document_id == document_id,
            GeneratedContent.content_type == "keypoints",
            GeneratedContent.subtype == "all"
        )
        .order_by(GeneratedContent.created_at.desc())
    )
    result = await db.execute(cache_query)
    cached_record = result.scalars().first()

    if not cached_record:
        return KeyPointsResponse(document_id=document_id, keypoints=[])

    try:
        raw_data = json.loads(cached_record.generated_text)
        categories = [
            KeyPointsCategory(
                category=c.get("category", "General"),
                points=c.get("points", [])
            ) for c in raw_data
        ]
        return KeyPointsResponse(document_id=document_id, keypoints=categories)
    except Exception as e:
        logger.error(f"Failed to parse cached key points: {e}")
        return KeyPointsResponse(document_id=document_id, keypoints=[])

@router.post("/", response_model=KeyPointsResponse)
async def extract_document_keypoints(
    request: KeyPointsRequest,
    db: AsyncSession = Depends(get_db),
    gemini_client: GeminiClient = Depends(get_gemini_client)
):
    """
    Extract structured key points (concepts, definitions, formulas, facts, exam tips)
    from a document. Uses Gemini AI and caches result in SQLite.
    """
    # 1. Check DB Cache
    cache_query = (
        select(GeneratedContent)
        .where(
            GeneratedContent.document_id == request.document_id,
            GeneratedContent.content_type == "keypoints",
            GeneratedContent.subtype == "all"
        )
        .order_by(GeneratedContent.created_at.desc())
    )
    cache_result = await db.execute(cache_query)
    cached_record = cache_result.scalars().first()

    if cached_record and not request.force_refresh:
        logger.info(f"Serving cached key points for document {request.document_id}")
        try:
            raw_data = json.loads(cached_record.generated_text)
            categories = [
                KeyPointsCategory(
                    category=c.get("category", "General"),
                    points=c.get("points", [])
                ) for c in raw_data
            ]
            return KeyPointsResponse(document_id=request.document_id, keypoints=categories)
        except Exception as e:
            logger.error(f"Failed to parse cached keypoints, regenerating: {e}")

    # 2. Document lookup
    doc = await db.get(Document, request.document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # 3. Fetch file path and extract text
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

    # 4. Query Gemini client to extract keypoints (if this fails, cached_record is preserved)
    try:
        logger.info(f"{'Re-extracting' if request.force_refresh else 'Extracting'} key points for document {request.document_id}")
        keypoints_data = await gemini_client.extract_keypoints(text)
        
        # 5. Persist or update existing record safely
        serialized = json.dumps(keypoints_data)
        if cached_record:
            cached_record.generated_text = serialized
            cached_record.model_used = gemini_client.model_name
            cached_record.created_at = datetime.utcnow()
            await db.commit()
            await db.refresh(cached_record)
        else:
            new_content = GeneratedContent(
                document_id=request.document_id,
                content_type="keypoints",
                subtype="all",
                generated_text=serialized,
                model_used=gemini_client.model_name
            )
            db.add(new_content)
            await db.commit()
            await db.refresh(new_content)

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

