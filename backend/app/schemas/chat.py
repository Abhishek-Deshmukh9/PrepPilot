from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique chat session identifier")
    document_id: Optional[str] = Field(None, description="Optional document ID. If provided, chat is contextual to this document.")
    question: str = Field(..., description="The query/question asked by the user")
    top_k: Optional[int] = Field(5, description="Number of source chunks to retrieve")

class SourceCitation(BaseModel):
    chunk_id: str
    text_snippet: str
    score: float
    page: Optional[int] = None
    filename: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatHistoryResponse(BaseModel):
    id: str
    session_id: str
    document_id: Optional[str]
    question: str
    answer: str
    sources: List[SourceCitation]
    timestamp: datetime

    class Config:
        from_attributes = True
