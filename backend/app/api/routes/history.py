from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging

from app.database.base import get_db
from app.models.chat_history import ChatHistory
from app.schemas.chat import ChatHistoryResponse, SourceCitation

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{session_id}", response_model=List[ChatHistoryResponse])
async def get_session_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get chat history for a specific session sorted chronologically.
    """
    query = (
        select(ChatHistory)
        .where(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.timestamp.asc())
    )
    result = await db.execute(query)
    histories = result.scalars().all()
    
    # Parse sources dynamically if stored as JSON list of dicts
    response_list = []
    for h in histories:
        sources_list = []
        if h.sources and isinstance(h.sources, list):
            for s in h.sources:
                sources_list.append(
                    SourceCitation(
                        chunk_id=s.get("chunk_id", ""),
                        text_snippet=s.get("text_snippet", ""),
                        score=s.get("score", 0.0),
                        page=s.get("page"),
                        filename=s.get("filename")
                    )
                )
        
        response_list.append(
            ChatHistoryResponse(
                id=h.id,
                session_id=h.session_id,
                document_id=h.document_id,
                question=h.question,
                answer=h.answer,
                sources=sources_list,
                timestamp=h.timestamp
            )
        )
    return response_list

@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
async def clear_session_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Clear all chat messages associated with a session ID.
    """
    query = select(ChatHistory).where(ChatHistory.session_id == session_id)
    result = await db.execute(query)
    messages = result.scalars().all()
    
    if not messages:
         return {"message": f"No chat history found for session {session_id}."}

    for msg in messages:
        await db.delete(msg)
    await db.commit()
    
    return {"message": f"Chat history for session {session_id} has been cleared."}
