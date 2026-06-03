from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    file_size: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    chunk_count: Optional[int] = None
    status: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class DocumentResponse(DocumentBase):
    id: str
    upload_date: datetime
    chunk_count: int
    status: str
    metadata_json: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
