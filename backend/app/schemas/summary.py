from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class SummaryRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to summarize")
    summary_type: Literal["executive", "detailed", "revision"] = Field("executive", description="Type of summary to generate")
    force_refresh: bool = Field(False, description="Whether to bypass cached summary and generate fresh content")

class SummaryResponse(BaseModel):
    document_id: str
    summary_type: str
    content: str
    created_at: datetime
