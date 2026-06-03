from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.database.base import get_db
from app.api.deps import get_interview_generator
from app.schemas.interview import InterviewRequest, InterviewResponse, MockQuestionItem
from app.services.generators.interview_generator import InterviewGenerator

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=InterviewResponse)
async def prepare_interview(
    request: InterviewRequest,
    db: AsyncSession = Depends(get_db),
    generator: InterviewGenerator = Depends(get_interview_generator)
):
    """
    Compare Candidate Resume (PDF/DOCX/TXT) against Job Description to generate HR,
    Technical, Behavioral, Project-based, and Mock Interview questions.
    """
    try:
        prep_data = await generator.generate_interview_prep(
            resume_document_id=request.resume_document_id,
            job_description=request.job_description,
            question_types=request.question_types,
            db=db
        )
        
        # Format Mock Interview Questions
        mock_items = []
        for mock in prep_data.get("mock_interview", []):
             mock_items.append(
                 MockQuestionItem(
                     question=mock.get("question", ""),
                     expected_answer_hint=mock.get("expected_answer_hint", "")
                 )
             )
             
        return InterviewResponse(
            hr=prep_data.get("hr", []),
            technical=prep_data.get("technical", []),
            behavioral=prep_data.get("behavioral", []),
            project=prep_data.get("project", []),
            mock_interview=mock_items
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        logger.error(f"Failed to generate interview prep: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview prep: {str(e)}"
        )
