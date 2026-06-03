from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
import json
import logging

from app.database.base import get_db
from app.api.deps import get_mcq_generator
from app.schemas.mcq import MCQRequest, MCQResponse, MCQItem
from app.services.generators.mcq_generator import MCQGenerator
from app.models.generated_content import GeneratedContent

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=MCQResponse)
async def generate_mcqs(
    request: MCQRequest,
    db: AsyncSession = Depends(get_db),
    generator: MCQGenerator = Depends(get_mcq_generator)
):
    """
    Generate multiple-choice questions from a document. Enforces JSON output format.
    Checks cache first.
    """
    try:
        mcqs_data = await generator.get_or_generate_mcqs(
            document_id=request.document_id,
            count=request.count,
            difficulty=request.difficulty,
            db=db
        )
        
        # Parse into MCQItem list
        items = []
        for item in mcqs_data:
             items.append(
                 MCQItem(
                     question=item.get("question", ""),
                     options=item.get("options", {}),
                     correct_answer=item.get("correct_answer", "A"),
                     explanation=item.get("explanation", ""),
                     difficulty=item.get("difficulty", "medium")
                 )
             )
             
        return MCQResponse(
            document_id=request.document_id,
            mcqs=items
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        logger.error(f"Failed to generate MCQs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate MCQs: {str(e)}"
        )

@router.get("/{document_id}", response_model=List[MCQResponse])
async def get_cached_mcqs(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all previously generated MCQ sets for a document.
    """
    query = select(GeneratedContent).where(
        GeneratedContent.document_id == document_id,
        GeneratedContent.content_type == "mcq"
    )
    result = await db.execute(query)
    mcq_sets = result.scalars().all()
    
    response = []
    for mset in mcq_sets:
         try:
             raw_mcqs = json.loads(mset.generated_text)
             items = [
                 MCQItem(
                     question=m.get("question", ""),
                     options=m.get("options", {}),
                     correct_answer=m.get("correct_answer", "A"),
                     explanation=m.get("explanation", ""),
                     difficulty=m.get("difficulty", "medium")
                 ) for m in raw_mcqs
             ]
             response.append(
                 MCQResponse(
                     document_id=mset.document_id,
                     mcqs=items
                 )
             )
         except Exception as e:
              logger.error(f"Error parsing MCQ set: {e}")
              
    return response
