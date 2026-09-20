from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("/health", tags=["System"])
async def get_health():
    """Lightweight health check endpoint for connection gateway testing."""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
    }

@router.get("/system/info", tags=["System"])
async def get_system_info():
    """Returns dynamic runtime architecture parameters and configuration."""
    return {
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "environment": settings.app_env,
        "llm_engine": settings.gemini_model,
        "embedding_model": settings.embedding_model,
        "chunk_size": settings.chunk_size,
        "chunk_overlap": settings.chunk_overlap,
        "top_k": settings.top_k,
        "max_file_size_mb": settings.max_file_size_mb,
        "status": "online"
    }
