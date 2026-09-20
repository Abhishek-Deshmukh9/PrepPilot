from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging
import os

from app.models.document import Document
from app.models.flashcard import Flashcard
from app.services.llm.gemini_client import GeminiClient
from app.services.rag.document_processor import DocumentProcessor
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class FlashcardGenerator:
    def __init__(self, gemini_client: GeminiClient):
        self.gemini_client = gemini_client

    async def get_or_generate_flashcards(
        self, 
        document_id: str, 
        deck_name: str, 
        count: int, 
        db: AsyncSession
    ) -> List[Flashcard]:
        """
        Check SQLite DB for existing flashcards in this deck. If not found,
        extract document text, generate via Gemini structured output, persist each item
        to the flashcards table, and return them.
        """
        # 1. Check SQLite Flashcards table
        cache_query = select(Flashcard).where(
            Flashcard.document_id == document_id,
            Flashcard.deck_name == deck_name
        )
        cache_result = await db.execute(cache_query)
        cached_flashcards = cache_result.scalars().all()
        
        if cached_flashcards:
            logger.info(f"Serving {len(cached_flashcards)} cached flashcards from deck '{deck_name}' for doc {document_id}")
            return list(cached_flashcards)

        # 2. Document lookup
        doc = await db.get(Document, document_id)
        if not doc:
             raise ValueError("Document not found")

        # 3. Read & extract text
        file_ext = f".{doc.file_type}"
        file_path = os.path.join(settings.upload_dir, f"{doc.id}{file_ext}")
        if not os.path.exists(file_path):
             raise FileNotFoundError("Document file not found on disk")

        logger.info(f"Generating new {count} flashcards for deck '{deck_name}' from doc {document_id}")
        text = DocumentProcessor.extract_text(file_path, doc.file_type)

        # 4. Invoke Gemini API
        flashcards_list = await self.gemini_client.generate_flashcards(text, count)

        # 5. Insert flashcard items into DB
        db_flashcards = []
        for card in flashcards_list:
             db_card = Flashcard(
                 document_id=document_id,
                 deck_name=deck_name,
                 front=card.get("front", ""),
                 back=card.get("back", ""),
                 difficulty="unreviewed"
             )
             db.add(db_card)
             db_flashcards.append(db_card)
             
        await db.commit()
        
        # Refresh to populate timestamps & auto IDs
        for card in db_flashcards:
             await db.refresh(card)

        return db_flashcards
