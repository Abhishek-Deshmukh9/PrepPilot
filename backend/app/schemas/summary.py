from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class SummaryRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to summarize")
    summary_type: Literal["executive", "detailed", "revision"] = Field("executive", description="Type of summary to generate")

class SummaryResponse(BaseModel):
    document_id: str
    summary_type: str
    content: str
    created_at: datetime
