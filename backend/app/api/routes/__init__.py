from fastapi import APIRouter
from app.api.routes.upload import router as upload_router
from app.api.routes.documents import router as documents_router
from app.api.routes.chat import router as chat_router
from app.api.routes.history import router as history_router
from app.api.routes.keypoints import router as keypoints_router
from app.api.routes.summary import router as summary_router
from app.api.routes.mcq import router as mcq_router
from app.api.routes.flashcards import router as flashcards_router
from app.api.routes.interview import router as interview_router
from app.api.routes.revision import router as revision_router

api_router = APIRouter()

api_router.include_router(upload_router, prefix="/upload", tags=["Upload"])
api_router.include_router(documents_router, prefix="/documents", tags=["Documents"])
api_router.include_router(chat_router, prefix="/chat", tags=["RAG Chat"])
api_router.include_router(history_router, prefix="/history", tags=["Chat History"])
api_router.include_router(keypoints_router, prefix="/keypoints", tags=["Study Tools"])
api_router.include_router(summary_router, prefix="/summary", tags=["Study Tools"])
api_router.include_router(mcq_router, prefix="/mcqs", tags=["Study Tools"])
api_router.include_router(flashcards_router, prefix="/flashcards", tags=["Study Tools"])
api_router.include_router(interview_router, prefix="/interview", tags=["Interview Prep"])
api_router.include_router(revision_router, prefix="/revision", tags=["Study Tools"])
