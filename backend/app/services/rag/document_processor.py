import os
from pypdf import PdfReader
from docx import Document as DocxDocument
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text page by page from a PDF file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            reader = PdfReader(file_path)
            full_text = []
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    full_text.append(text)
            
            return "\n\n".join(full_text)
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
            raise RuntimeError(f"Failed to process PDF file: {e}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract paragraphs from a DOCX file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            doc = DocxDocument(file_path)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text)
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {e}")
            raise RuntimeError(f"Failed to process DOCX file: {e}")

    @staticmethod
    def extract_text_from_txt(file_path: str) -> str:
        """Extract text from a raw TXT file, supporting UTF-8 and Fallback encodings."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            # Fallback to Latin-1 if UTF-8 fails
            try:
                with open(file_path, "r", encoding="latin-1") as f:
                    return f.read()
            except Exception as e:
                logger.error(f"Error decoding text file {file_path}: {e}")
                raise RuntimeError(f"Failed to decode text file: {e}")
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {e}")
            raise RuntimeError(f"Failed to process TXT file: {e}")

    @classmethod
    def extract_text(cls, file_path: str, file_type: str) -> str:
        """Helper to call appropriate extractor based on file type."""
        file_type = file_type.lower().strip()
        if file_type == "pdf":
            return cls.extract_text_from_pdf(file_path)
        elif file_type in ("docx", "doc"):
            return cls.extract_text_from_docx(file_path)
        elif file_type == "txt":
            return cls.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
