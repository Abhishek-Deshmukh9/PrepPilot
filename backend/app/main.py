from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
import os
import logging
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database.base import init_db
from app.middleware.rate_limiter import limiter
from app.api.routes import api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting PrepPilot AI Backend...")
    
    # Create upload directory if missing
    os.makedirs(settings.upload_dir, exist_ok=True)
    logger.info(f"Local upload directory verified at {settings.upload_dir}")
    
    # Initialize DB tables
    logger.info("Initializing metadata database...")
    await init_db()
    logger.info("Database initialized successfully.")
    
    yield
    # Shutdown actions
    logger.info("Shutting down PrepPilot AI Backend...")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Your Personal AI-Powered Study, Revision, and Interview Assistant Backend.",
    lifespan=lifespan,
)

# SlowAPI setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["General"])
async def root():
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "status": "online"
    }

@app.get("/health", tags=["General"])
async def health():
    return {"status": "healthy"}
