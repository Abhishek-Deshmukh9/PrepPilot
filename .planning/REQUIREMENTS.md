# PrepPilot AI — Requirements

## Functional Requirements

### FR-1: Document Ingestion Pipeline ✅
- **FR-1.1:** Upload PDF, DOCX, TXT files (up to 50MB) via drag-and-drop
- **FR-1.2:** Extract text content from all supported formats
- **FR-1.3:** Chunk documents into 500-token windows with 100-token overlap
- **FR-1.4:** Generate embeddings and store in per-document vector collections
- **FR-1.5:** Track document status (processing → ready → error)
- **FR-1.6:** List, view, and delete documents with cascade cleanup

### FR-2: RAG Chat (Ask AI Anything) ⚠️ Partially Broken
- **FR-2.1:** Accept questions with active document context
- **FR-2.2:** Retrieve top-K relevant chunks via vector similarity
- **FR-2.3:** Generate document-grounded answers via Gemini
- **FR-2.4:** Include source citations (page, snippet, relevance score)
- **FR-2.5:** Persist chat history per session
- **FR-2.6:** ❌ Frontend uses hardcoded mocks instead of real API

### FR-3: Document Summarization ✅
- **FR-3.1:** Generate 3 types: executive, detailed, revision
- **FR-3.2:** Cache generated summaries per document
- **FR-3.3:** Display with markdown rendering

### FR-4: MCQ Exam Engine ✅
- **FR-4.1:** Generate 10/20/50 MCQs with difficulty levels
- **FR-4.2:** Structured JSON output (question, options, answer, explanation)
- **FR-4.3:** Full quiz flow with scoring and feedback

### FR-5: Flashcard Decks ✅
- **FR-5.1:** Generate front/back flashcards from document content
- **FR-5.2:** CSS 3D flip animation for card interaction
- **FR-5.3:** Self-rating system (easy/medium/hard)
- **FR-5.4:** ❌ Ratings lost on page refresh (state only)

### FR-6: Mock Interview ✅
- **FR-6.1:** Accept resume text and job description
- **FR-6.2:** Generate recruiter-style interview questions
- **FR-6.3:** Provide model answers and evaluation tips

### FR-7: Key Points Extraction ⚠️ Backend Only
- **FR-7.1:** Extract categorized concepts, definitions, formulas, facts
- **FR-7.2:** ✅ Backend API operational
- **FR-7.3:** ✅ Frontend page exists at `/keypoints`

### FR-8: Revision Sheets ✅
- **FR-8.1:** Generate cheat sheets and last-minute revision notes
- **FR-8.2:** Cache per document
- **FR-8.3:** ❌ Markdown parsing has regex bugs

### FR-9: Navigation & Layout ✅
- **FR-9.1:** Landing page with feature overview
- **FR-9.2:** Dashboard with quick actions
- **FR-9.3:** Sidebar navigation for all modes
- **FR-9.4:** Dark/light theme toggle

## Non-Functional Requirements

### NFR-1: Performance
- Document processing in background (non-blocking)
- LLM responses within 10s for typical queries
- Chunked embedding for large documents

### NFR-2: Usability
- WCAG AA compliance target
- Dark mode first-class
- Responsive design for desktop (primary) and tablet
- KaTeX math rendering support

### NFR-3: Reliability
- Rate limiting via SlowAPI
- Graceful error handling for LLM failures
- Document processing status tracking

### NFR-4: Security
- CORS configured for known origins
- File type and size validation on upload
- No auth in v1 (single-user); JWT planned for v2

### NFR-5: Deployment
- Docker Compose for production
- Vercel for frontend (static build)
- Local development via Vite dev server + Uvicorn
