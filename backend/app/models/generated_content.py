import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class GeneratedContent(Base):
    __tablename__ = "generated_content"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False) # 'summary', 'mcq', 'revision', 'keypoints'
    subtype: Mapped[str] = mapped_column(String(50), nullable=True) # 'executive', 'detailed', 'cheat_sheet', etc.
    generated_text: Mapped[str] = mapped_column(String, nullable=False)
    model_used: Mapped[str] = mapped_column(String(50), default="gemini-2.0-flash")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("Document", back_populates="generated_contents")
