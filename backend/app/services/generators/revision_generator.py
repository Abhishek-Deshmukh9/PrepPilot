from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import logging
import os

from app.models.document import Document
from app.models.generated_content import GeneratedContent
from app.services.llm.gemini_client import GeminiClient
from app.services.rag.document_processor import DocumentProcessor
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class RevisionGenerator:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client

    async def get_or_generate_revision_notes(
        self, 
        document_id: str, 
        revision_type: str, 
        db: AsyncSession,
        force_refresh: bool = False
    ) -> GeneratedContent:
        """
        Check database cache for existing revision notes. If not found or force_refresh is True,
        extract document text, generate via Gemini, cache, and return.
        """
        # 1. Check DB Cache
        cache_query = select(GeneratedContent).where(
            GeneratedContent.document_id == document_id,
            GeneratedContent.content_type == "revision",
            GeneratedContent.subtype == revision_type
        )
        cache_result = await db.execute(cache_query)
        cached_notes = cache_result.scalar_one_or_none()
        
        if cached_notes and not force_refresh:
            logger.info(f"Serving cached '{revision_type}' revision notes for document {document_id}")
            return cached_notes

        # 2. Document lookup
        doc = await db.get(Document, document_id)
        if not doc:
             raise ValueError("Document not found")

        # 3. Read & extract text
        file_ext = f".{doc.file_type}"
        file_path = os.path.join(settings.upload_dir, f"{doc.id}{file_ext}")
        if not os.path.exists(file_path):
             raise FileNotFoundError("Document file not found on disk")

        logger.info(f"{'Regenerating' if force_refresh else 'Generating'} '{revision_type}' revision notes for document {document_id}")
        text = DocumentProcessor.extract_text(file_path, doc.file_type)

        # 4. Invoke Gemini API (if this fails, existing cached_notes is preserved)
        revision_text = await self.gemini_client.generate_revision_notes(text, revision_type)

        # 5. Persist or update existing record safely
        if cached_notes:
            cached_notes.generated_text = revision_text
            cached_notes.model_used = self.gemini_client.model_name
            cached_notes.created_at = datetime.utcnow()
            await db.commit()
            await db.refresh(cached_notes)
            return cached_notes
        else:
            new_content = GeneratedContent(
                document_id=document_id,
                content_type="revision",
                subtype=revision_type,
                generated_text=revision_text,
                model_used=self.gemini_client.model_name
            )
            db.add(new_content)
            await db.commit()
            await db.refresh(new_content)
            return new_content
