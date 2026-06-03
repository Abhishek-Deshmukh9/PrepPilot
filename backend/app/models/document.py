import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False) # 'pdf', 'docx', 'txt'
    upload_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    file_size: Mapped[int] = mapped_column(Integer, nullable=True) # bytes
    status: Mapped[str] = mapped_column(String(20), default="processing") # 'processing', 'ready', 'error'
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    chat_histories = relationship("ChatHistory", back_populates="document", cascade="all, delete-orphan")
    generated_contents = relationship("GeneratedContent", back_populates="document", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="document", cascade="all, delete-orphan")
