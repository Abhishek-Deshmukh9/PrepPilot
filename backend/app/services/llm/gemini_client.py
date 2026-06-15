from google import genai
from google.genai import types
from google.genai.errors import APIError, ClientError, ServerError
from app.config import get_settings
from typing import List, Dict, Any, Optional
import json
import logging
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

logger = logging.getLogger(__name__)
settings = get_settings()

def is_transient_error(exception: Exception) -> bool:
    """Determine if a GenAI API exception is transient and should be retried."""
    if isinstance(exception, ServerError):
        return True
    if isinstance(exception, ClientError):
        # Retry on HTTP 429 (Rate Limit) if it's transient, otherwise do not retry 4xx errors
        code = getattr(exception, 'code', None)
        if code == 429 or (code is None and "429" in str(exception)):
            return True
        return False
    if isinstance(exception, APIError):
        return True
    return False

class GeminiClient:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.client = None
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. Gemini API calls will fail.")
        else:
            self.client = genai.Client(api_key=self.api_key)
        
        # Load from config settings, default to gemini-2.5-flash
        self.model_name = getattr(settings, 'gemini_model', 'gemini-2.5-flash')
        print("USING MODEL:", self.model_name)

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def _call_gemini_api(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        response_schema: Optional[Any] = None,
        is_json: bool = False
    ) -> str:
        """Helper to invoke Gemini API with retries and structural configuration."""
        if not self.api_key or not self.client:
            raise ValueError("Gemini API key is missing. Please set GEMINI_API_KEY in the environment.")
            
        config = types.GenerateContentConfig()
        if system_instruction:
            config.system_instruction = system_instruction
        if is_json:
            config.response_mime_type = "application/json"
            if response_schema:
                config.response_schema = response_schema

        try:
            # Call modern SDK's synchronous generate_content in a thread pool to avoid blocking the loop
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt,
                config=config
            )
        except Exception as e:
            logger.error(f"GEMINI ERROR: {repr(e)}")
            raise
            
        if not response.text:
            raise RuntimeError("Gemini returned an empty response.")
            
        return response.text

    async def generate_answer(
        self, 
        context: str, 
        question: str, 
        chat_history: List[Dict[str, str]]
    ) -> str:
        """
        Generates context-grounded answers for the RAG Chat.
        """
        system_instruction = (
            "You are PrepPilot AI, an expert academic and technical tutor. "
            "Answer the user's question using ONLY the provided document context. "
            "For citation, cite specific details (like page numbers or sections) if present. "
            "If the answer cannot be found in the context, politely state that you don't know "
            "based on the document, and do not make up facts."
        )

        # Format history
        history_str = ""
        if chat_history:
            history_str = "Chat History:\n" + "\n".join(
                [f"User: {h['question']}\nPrepPilot: {h['answer']}" for h in chat_history]
            ) + "\n\n"

        prompt = (
            f"Context:\n{context}\n\n"
            f"{history_str}"
            f"Question: {question}\n"
            f"Answer:"
        )

        return await self._call_gemini_api(prompt, system_instruction=system_instruction)

    async def generate_summary(
        self, 
        text: str, 
        summary_type: str
    ) -> str:
        """
        Generates executive, detailed, or revision summaries.
        """
        type_prompts = {
            "executive": "Write a high-level executive summary summarizing the core theme, findings, and takeaways. Keep it concise.",
            "detailed": "Write a comprehensive, detailed summary breaking down the structure, key concepts, detailed sections, and conclusions.",
            "revision": "Write a high-yield one-page revision summary highlighting the most critical definitions, concepts, and relationships to memorize."
        }

        prompt_instruction = type_prompts.get(summary_type, type_prompts["executive"])
        
        system_instruction = (
            "You are an expert academic writer and summarizer. Write clear, well-structured, "
            "formatted summaries in Markdown format using bullet points, headers, and bold text."
        )

        prompt = (
            f"{prompt_instruction}\n\n"
            f"Document Content:\n{text}\n"
        )

        return await self._call_gemini_api(prompt, system_instruction=system_instruction)

    async def generate_mcqs(
        self, 
        text: str, 
        count: int, 
        difficulty: str
    ) -> List[Dict[str, Any]]:
        """
        Generates structured MCQs from the document text.
        Returns a list of MCQ dicts.
        """
        system_instruction = (
            "You are an elite academic exam creator. Create high-quality, multiple-choice questions "
            "directly testing material in the document. Ensure that correct answers are unambiguous, "
            "and wrong options (distractors) are plausible but incorrect. Provide a complete, educational explanation."
        )

        # Enforce exact JSON response schema using a schema definition
        # Since we want to use structural outputs, let's pass a schema prompt first or a dictionary schema
        # For simplicity and compatibility, we can prompt for a specific JSON structure:
        # { "mcqs": [ { "question": str, "options": { "A": str, "B": str, "C": str, "D": str }, "correct_answer": "A"|"B"|"C"|"D", "explanation": str, "difficulty": str } ] }
        schema = {
            "type": "OBJECT",
            "properties": {
                "mcqs": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "question": {"type": "STRING"},
                            "options": {
                                "type": "OBJECT",
                                "properties": {
                                    "A": {"type": "STRING"},
                                    "B": {"type": "STRING"},
                                    "C": {"type": "STRING"},
                                    "D": {"type": "STRING"}
                                },
                                "required": ["A", "B", "C", "D"]
                            },
                            "correct_answer": {"type": "STRING", "description": "Must be A, B, C, or D"},
                            "explanation": {"type": "STRING"},
                            "difficulty": {"type": "STRING"}
                        },
                        "required": ["question", "options", "correct_answer", "explanation", "difficulty"]
                    }
                }
            },
            "required": ["mcqs"]
        }

        prompt = (
            f"Generate exactly {count} multiple choice questions with {difficulty} difficulty from the text below.\n"
            f"Ensure correct_answer is exactly one of A, B, C, or D.\n\n"
            f"Document Content:\n{text}"
        )

        response_text = await self._call_gemini_api(
            prompt, 
            system_instruction=system_instruction, 
            response_schema=schema,
            is_json=True
        )

        try:
            data = json.loads(response_text)
            return data.get("mcqs", [])
        except Exception as e:
            logger.error(f"Failed to parse JSON MCQs from Gemini: {e}. Raw response: {response_text}")
            raise RuntimeError("Gemini failed to output valid structured MCQs.")

    async def generate_flashcards(
        self, 
        text: str, 
        count: int
    ) -> List[Dict[str, str]]:
        """
        Generates flashcards (front/back questions and answers) from document text.
        """
        system_instruction = (
            "You are a learning assistant. Extract key definitions, concepts, and questions "
            "to create study flashcards. The front must be a concise question or term, and the "
            "back must be a clear, informative answer or definition."
        )

        schema = {
            "type": "OBJECT",
            "properties": {
                "flashcards": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "front": {"type": "STRING"},
                            "back": {"type": "STRING"},
                            "difficulty": {"type": "STRING"}
                        },
                        "required": ["front", "back", "difficulty"]
                    }
                }
            },
            "required": ["flashcards"]
        }

        prompt = (
            f"Generate exactly {count} flashcards from the text below.\n\n"
            f"Document Content:\n{text}"
        )

        response_text = await self._call_gemini_api(
            prompt, 
            system_instruction=system_instruction, 
            response_schema=schema,
            is_json=True
        )

        try:
            data = json.loads(response_text)
            return data.get("flashcards", [])
        except Exception as e:
            logger.error(f"Failed to parse JSON Flashcards from Gemini: {e}")
            raise RuntimeError("Gemini failed to output valid structured Flashcards.")

    async def generate_interview_questions(
        self, 
        resume_text: str, 
        job_description: str, 
        question_types: List[str]
    ) -> Dict[str, Any]:
        """
        Generates interview questions categorized by HR, Technical, Behavioral, Project, and Mock Interview.
        """
        system_instruction = (
            "You are a seasoned principal technical recruiter and hiring manager. "
            "Compare the candidate's resume with the job description. "
            "Generate targeted interview questions designed to test fit, depth, and experience."
        )

        schema = {
            "type": "OBJECT",
            "properties": {
                "hr": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "technical": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "behavioral": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "project": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "mock_interview": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "question": {"type": "STRING"},
                            "expected_answer_hint": {"type": "STRING"}
                        },
                        "required": ["question", "expected_answer_hint"]
                    }
                }
            },
            "required": ["hr", "technical", "behavioral", "project", "mock_interview"]
        }

        prompt = (
            f"Resume Content:\n{resume_text}\n\n"
            f"Job Description:\n{job_description}\n\n"
            f"Generate high-yield questions for the requested categories: {', '.join(question_types)}. "
            f"Include mock interview questions with expectations."
        )

        response_text = await self._call_gemini_api(
            prompt, 
            system_instruction=system_instruction, 
            response_schema=schema,
            is_json=True
        )

        try:
            return json.loads(response_text)
        except Exception as e:
            logger.error(f"Failed to parse JSON Interview questions: {e}")
            raise RuntimeError("Gemini failed to output valid structured interview questions.")

    async def extract_keypoints(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract key points from a document, categorized (Concepts, Definitions, Formulas, Facts, Tips).
        """
        system_instruction = (
            "You are a study guide writer. Extract and organize key points from the document "
            "into clear, high-yield categories: Concepts, Definitions, Formulas, Facts, and Exam Tips."
        )

        schema = {
            "type": "OBJECT",
            "properties": {
                "keypoints": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "category": {"type": "STRING", "description": "e.g. Concepts, Definitions, Formulas, Facts, or Tips"},
                            "points": {
                                "type": "ARRAY",
                                "items": {"type": "STRING"}
                            }
                        },
                        "required": ["category", "points"]
                    }
                }
            },
            "required": ["keypoints"]
        }

        prompt = (
            "Extract structured key points from the following text, categorized by Concepts, Definitions, "
            "Formulas, Facts, and Tips.\n\n"
            f"Document Content:\n{text}"
        )

        response_text = await self._call_gemini_api(
            prompt,
            system_instruction=system_instruction,
            response_schema=schema,
            is_json=True
        )

        try:
            data = json.loads(response_text)
            return data.get("keypoints", [])
        except Exception as e:
            logger.error(f"Failed to parse JSON keypoints: {e}")
            raise RuntimeError("Gemini failed to output valid structured keypoints.")

    async def generate_revision_notes(self, text: str, revision_type: str) -> str:
        """
        Generates Markdown formatting revision sheet / last-minute cheat sheet.
        """
        prompts = {
            "last_minute": "Create a 'Last Minute Revision Sheet' containing high-priority definitions, concepts, and summaries that a student must memorize right before an exam.",
            "cheat_sheet": "Create a 'Cheat Sheet' style study guide compiling formulas, short facts, bullet summaries, and structured reference tables.",
            "important_questions": "Compile a list of 'Important Exam Questions' along with brief model answers compiled from this document."
        }

        prompt_instruction = prompts.get(revision_type, prompts["last_minute"])

        system_instruction = (
            "You are an expert exam preparation tutor. Generate extremely concise, "
            "clear, high-density study sheets in formatted Markdown. Maximize layout density and scanning speed."
        )

        prompt = (
            f"{prompt_instruction}\n\n"
            f"Document Content:\n{text}\n"
        )

        return await self._call_gemini_api(prompt, system_instruction=system_instruction)
