from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class InterviewRequest(BaseModel):
    resume_document_id: str = Field(..., description="Document ID of the uploaded resume PDF")
    job_description: str = Field(..., description="Job Description text to match against")
    question_types: Optional[List[str]] = Field(
        ["hr", "technical", "behavioral", "project"],
        description="Types of questions to generate (hr, technical, behavioral, project, mock_interview)"
    )

class MockQuestionItem(BaseModel):
    question: str
    expected_answer_hint: str

class InterviewResponse(BaseModel):
    hr: List[str] = Field(default_factory=list)
    technical: List[str] = Field(default_factory=list)
    behavioral: List[str] = Field(default_factory=list)
    project: List[str] = Field(default_factory=list)
    mock_interview: List[MockQuestionItem] = Field(default_factory=list)
