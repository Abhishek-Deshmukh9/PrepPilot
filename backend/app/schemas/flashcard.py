from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class FlashcardItem(BaseModel):
    front: str = Field(..., description="Front side of the flashcard (Question/Concept)")
    back: str = Field(..., description="Back side of the flashcard (Answer/Explanation)")
    difficulty: Optional[str] = Field("medium", description="Flashcard difficulty rating")

class FlashcardRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to generate flashcards from")
    deck_name: Optional[str] = Field("Default Deck", description="Name of the flashcard deck")
    count: Optional[int] = Field(20, description="Number of flashcards to generate")

class FlashcardResponse(BaseModel):
    id: str
    document_id: str
    deck_name: Optional[str]
    front: str
    back: str
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True

class FlashcardListResponse(BaseModel):
    document_id: str
    deck_name: Optional[str]
    flashcards: List[FlashcardResponse]
