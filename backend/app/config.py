from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_env: str = "development"
    app_name: str = "PrepPilot AI"
    app_version: str = "1.0.0"
    secret_key: str = "change-me-in-production"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Gemini AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Storage
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 50

    # ChromaDB
    chroma_persist_dir: str = "./chroma_db"

    # Database
    database_url: str = "sqlite+aiosqlite:///./preppilot.db"

    # Embedding Model
    embedding_model: str = "all-MiniLM-L6-v2"

    # RAG Config
    chunk_size: int = 500
    chunk_overlap: int = 100
    top_k: int = 5

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    return Settings()
