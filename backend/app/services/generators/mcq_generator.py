from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import json
import logging
import os

from app.models.document import Document
from app.models.generated_content import GeneratedContent
from app.services.llm.gemini_client import GeminiClient
from app.services.rag.document_processor import DocumentProcessor
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class MCQGenerator:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client

    async def get_or_generate_mcqs(
        self, 
        document_id: str, 
        count: int, 
        difficulty: str, 
        db: AsyncSession,
        force_refresh: bool = False
    ) -> list:
        """
        Check database cache for existing MCQs. If not found or force_refresh is True,
        extract document text, generate via Gemini structured output, cache, and return.
        """
        subtype = f"{count}_{difficulty}"
        
        # 1. Check DB Cache
        cache_query = select(GeneratedContent).where(
            GeneratedContent.document_id == document_id,
            GeneratedContent.content_type == "mcq",
            GeneratedContent.subtype == subtype
        )
        cache_result = await db.execute(cache_query)
        cached_content = cache_result.scalar_one_or_none()
        
        if cached_content and not force_refresh:
            logger.info(f"Serving cached MCQs ({subtype}) for document {document_id}")
            try:
                return json.loads(cached_content.generated_text)
            except Exception as e:
                logger.error(f"Failed to parse cached MCQs: {e}")
                # Fall through to re-generate if cache is corrupted

        # 2. Document lookup
        doc = await db.get(Document, document_id)
        if not doc:
             raise ValueError("Document not found")

        # 3. Read & extract text
        file_ext = f".{doc.file_type}"
        file_path = os.path.join(settings.upload_dir, f"{doc.id}{file_ext}")
        if not os.path.exists(file_path):
             raise FileNotFoundError("Document file not found on disk")

        logger.info(f"{'Regenerating' if force_refresh else 'Generating'} {count} MCQs ({difficulty}) for document {document_id}")
        text = DocumentProcessor.extract_text(file_path, doc.file_type)

        # 4. Invoke Gemini API (if this fails, cached_content is preserved)
        mcqs_list = await self.gemini_client.generate_mcqs(text, count, difficulty)

        # 5. Persist or update existing record safely
        serialized = json.dumps(mcqs_list)
        if cached_content:
            cached_content.generated_text = serialized
            cached_content.model_used = self.gemini_client.model_name
            cached_content.created_at = datetime.utcnow()
            await db.commit()
            await db.refresh(cached_content)
        else:
            new_content = GeneratedContent(
                document_id=document_id,
                content_type="mcq",
                subtype=subtype,
                generated_text=serialized,
                model_used=self.gemini_client.model_name
            )
            db.add(new_content)
            await db.commit()
            await db.refresh(new_content)

        return mcqs_list
