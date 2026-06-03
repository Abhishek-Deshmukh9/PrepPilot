from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging

from app.database.base import get_db
from app.api.deps import get_retriever, get_gemini_client
from app.schemas.chat import ChatRequest, ChatResponse, SourceCitation
from app.models.chat_history import ChatHistory
from app.models.document import Document
from app.services.rag.retriever import Retriever
from app.services.llm.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_with_document(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    retriever: Retriever = Depends(get_retriever),
    gemini_client: GeminiClient = Depends(get_gemini_client)
):
    """
    RAG Chat endpoint. Retrieves relevant chunks based on user query,
    queries the SQLite DB for session history, constructs a context-aware prompt,
    and calls Gemini to generate a response.
    """
    # 1. If document_id is provided, verify document exists and is ready
    if request.document_id:
        doc = await db.get(Document, request.document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {request.document_id} not found."
            )
        if doc.status != "ready":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Document is in status '{doc.status}' and is not ready for chat."
            )

    # 2. Retrieve session chat history for memory context (last 5 messages)
    history_query = (
        select(ChatHistory)
        .where(ChatHistory.session_id == request.session_id)
        .order_by(ChatHistory.timestamp.desc())
        .limit(5)
    )
    history_result = await db.execute(history_query)
    # Reverse to keep chronological order
    raw_history = list(reversed(history_result.scalars().all()))
    chat_history_list = [
        {"question": h.question, "answer": h.answer} for h in raw_history
    ]

    # 3. Retrieve relevant chunks if document_id is provided, otherwise search is empty or global
    sources = []
    context = ""
    if request.document_id:
        try:
            retrieved_chunks = retriever.retrieve_context(
                document_id=request.document_id,
                question=request.question,
                top_k=request.top_k
            )
            
            # Format context and sources
            context_blocks = []
            for chunk in retrieved_chunks:
                citation = SourceCitation(
                    chunk_id=chunk["chunk_id"],
                    text_snippet=chunk["text_snippet"],
                    score=chunk["score"],
                    page=chunk["metadata"].get("page_number"),
                    filename=chunk["metadata"].get("filename")
                )
                sources.append(citation)
                context_blocks.append(
                    f"[Source: {citation.filename or 'Doc'}, Chunk ID: {citation.chunk_id}, Page: {citation.page or 'N/A'}]\n"
                    f"{citation.text_snippet}"
                )
            context = "\n\n".join(context_blocks)
        except Exception as e:
            logger.error(f"Error during context retrieval: {e}")
            # Non-blocking context failure; continue without document grounding if retrieval errors out
            context = ""

    # 4. Generate answer using Gemini
    try:
        answer = await gemini_client.generate_answer(
            context=context,
            question=request.question,
            chat_history=chat_history_list
        )
    except Exception as e:
        logger.error(f"Failed to generate answer via Gemini: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )

    # 5. Store new chat interaction in DB history
    try:
        new_history = ChatHistory(
            session_id=request.session_id,
            document_id=request.document_id,
            question=request.question,
            answer=answer,
            sources=[s.model_dump() for s in sources]
        )
        db.add(new_history)
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to persist chat history to database: {e}")
        # Not throwing HTTP exception to allow returning response to user even if DB log fails

    return ChatResponse(
        answer=answer,
        sources=sources,
        session_id=request.session_id
    )
