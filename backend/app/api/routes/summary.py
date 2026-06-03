from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging

from app.database.base import get_db
from app.api.deps import get_summary_generator
from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services.generators.summary_generator import SummaryGenerator
from app.models.generated_content import GeneratedContent

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=SummaryResponse)
async def generate_summary(
    request: SummaryRequest,
    db: AsyncSession = Depends(get_db),
    generator: SummaryGenerator = Depends(get_summary_generator)
):
    """
    Generate or get a cached summary (executive, detailed, or revision) of a document.
    """
    try:
        content_record = await generator.get_or_generate_summary(
            document_id=request.document_id,
            summary_type=request.summary_type,
            db=db
        )
        return SummaryResponse(
            document_id=content_record.document_id,
            summary_type=content_record.subtype,
            content=content_record.generated_text,
            created_at=content_record.created_at
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        logger.error(f"Failed to generate summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )

@router.get("/{document_id}", response_model=List[SummaryResponse])
async def get_document_summaries(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all previously generated summaries for a specific document.
    """
    query = select(GeneratedContent).where(
        GeneratedContent.document_id == document_id,
        GeneratedContent.content_type == "summary"
    )
    result = await db.execute(query)
    summaries = result.scalars().all()
    
    return [
        SummaryResponse(
            document_id=s.document_id,
            summary_type=s.subtype,
            content=s.generated_text,
            created_at=s.created_at
        ) for s in summaries
    ]
