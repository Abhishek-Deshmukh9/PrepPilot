from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import logging
import os

from app.models.document import Document
from app.services.llm.gemini_client import GeminiClient
from app.services.rag.document_processor import DocumentProcessor
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class InterviewGenerator:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client

    async def generate_interview_prep(
        self, 
        resume_document_id: str, 
        job_description: str, 
        question_types: List[str],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Extract resume text and call Gemini to generate matching interview questions.
        """
        # 1. Resume lookup
        doc = await db.get(Document, resume_document_id)
        if not doc:
             raise ValueError("Resume document not found")

        # 2. Read & extract text
        file_ext = f".{doc.file_type}"
        file_path = os.path.join(settings.upload_dir, f"{doc.id}{file_ext}")
        if not os.path.exists(file_path):
             raise FileNotFoundError("Resume file not found on disk")

        logger.info(f"Generating interview prep from resume {resume_document_id} and job description")
        resume_text = DocumentProcessor.extract_text(file_path, doc.file_type)

        # 3. Invoke Gemini API
        prep_data = await self.gemini_client.generate_interview_questions(
            resume_text=resume_text,
            job_description=job_description,
            question_types=question_types
        )

        return prep_data
