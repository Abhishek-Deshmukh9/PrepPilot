from pydantic import BaseModel, Field
from typing import Dict, List, Literal, Optional

class MCQItem(BaseModel):
    question: str
    options: Dict[str, str] = Field(..., description="Dictionary of options (A, B, C, D)")
    correct_answer: Literal["A", "B", "C", "D"]
    explanation: str
    difficulty: str

class MCQRequest(BaseModel):
    document_id: str = Field(..., description="Document ID to generate MCQs from")
    count: Literal[10, 20, 50] = Field(10, description="Number of MCQs to generate")
    difficulty: Optional[Literal["easy", "medium", "hard"]] = Field("medium", description="Desired difficulty level")

class MCQResponse(BaseModel):
    document_id: str
    mcqs: List[MCQItem]
