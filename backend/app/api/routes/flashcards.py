from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging

from app.database.base import get_db
from app.api.deps import get_flashcard_generator
from app.schemas.flashcard import (
    FlashcardRequest,
    FlashcardListResponse,
    FlashcardResponse,
    FlashcardRatingUpdate,
)
from app.services.generators.flashcard_generator import FlashcardGenerator
from app.models.flashcard import Flashcard

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=FlashcardListResponse)
async def generate_flashcards(
    request: FlashcardRequest,
    db: AsyncSession = Depends(get_db),
    generator: FlashcardGenerator = Depends(get_flashcard_generator)
):
    """
    Generate flashcards from a document. Persists flashcard records in SQLite.
    Checks cache first.
    """
    try:
        flashcards = await generator.get_or_generate_flashcards(
            document_id=request.document_id,
            deck_name=request.deck_name,
            count=request.count,
            db=db
        )
        
        # Format response
        response_cards = [
            FlashcardResponse(
                id=c.id,
                document_id=c.document_id,
                deck_name=c.deck_name,
                front=c.front,
                back=c.back,
                difficulty=c.difficulty,
                created_at=c.created_at
            ) for c in flashcards
        ]
        
        return FlashcardListResponse(
            document_id=request.document_id,
            deck_name=request.deck_name,
            flashcards=response_cards
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        logger.error(f"Failed to generate flashcards: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flashcards: {str(e)}"
        )

@router.get("/{document_id}", response_model=List[FlashcardResponse])
async def get_document_flashcards(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all previously generated flashcards for a document.
    """
    query = select(Flashcard).where(Flashcard.document_id == document_id)
    result = await db.execute(query)
    cards = result.scalars().all()
    
    return [
        FlashcardResponse(
            id=c.id,
            document_id=c.document_id,
            deck_name=c.deck_name,
            front=c.front,
            back=c.back,
            difficulty=c.difficulty,
            created_at=c.created_at
        ) for c in cards
    ]

@router.patch("/{card_id}/rating", response_model=FlashcardResponse)
async def update_flashcard_rating(
    card_id: str,
    rating_data: FlashcardRatingUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update the difficulty rating for an existing flashcard ('easy', 'medium', 'hard').
    """
    card = await db.get(Flashcard, card_id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flashcard with ID {card_id} not found."
        )

    card.difficulty = rating_data.difficulty
    await db.commit()
    await db.refresh(card)

    return FlashcardResponse(
        id=card.id,
        document_id=card.document_id,
        deck_name=card.deck_name,
        front=card.front,
        back=card.back,
        difficulty=card.difficulty,
        created_at=card.created_at
    )
