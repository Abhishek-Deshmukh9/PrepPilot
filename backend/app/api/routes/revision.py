from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime
import logging

from app.database.base import get_db
from app.api.deps import get_revision_generator
from app.services.generators.revision_generator import RevisionGenerator
from app.models.generated_content import GeneratedContent

logger = logging.getLogger(__name__)

router = APIRouter()

class RevisionRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to generate revision notes for")
    revision_type: Literal["last_minute", "cheat_sheet", "important_questions"] = Field(
        "last_minute", description="Type of revision sheet to generate"
    )

class RevisionResponse(BaseModel):
    document_id: str
    revision_type: str
    content: str
    created_at: datetime

@router.post("/", response_model=RevisionResponse)
async def generate_revision_notes(
    request: RevisionRequest,
    db: AsyncSession = Depends(get_db),
    generator: RevisionGenerator = Depends(get_revision_generator)
):
    """
    Generate quick study revision notes (last minute sheets, cheat sheets, exam Q/A).
    """
    try:
        content_record = await generator.get_or_generate_revision_notes(
            document_id=request.document_id,
            revision_type=request.revision_type,
            db=db
        )
        return RevisionResponse(
            document_id=content_record.document_id,
            revision_type=content_record.subtype,
            content=content_record.generated_text,
            created_at=content_record.created_at
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        logger.error(f"Failed to generate revision notes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate revision notes: {str(e)}"
        )

@router.get("/{document_id}", response_model=List[RevisionResponse])
async def get_document_revision_notes(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all previously generated revision notes for a specific document.
    """
    query = select(GeneratedContent).where(
        GeneratedContent.document_id == document_id,
        GeneratedContent.content_type == "revision"
    )
    result = await db.execute(query)
    revisions = result.scalars().all()
    
    return [
        RevisionResponse(
            document_id=r.document_id,
            revision_type=r.subtype,
            content=r.generated_text,
            created_at=r.created_at
        ) for r in revisions
    ]
