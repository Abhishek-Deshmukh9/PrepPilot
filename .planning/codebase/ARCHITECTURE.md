# PrepPilot AI — Codebase Architecture Map

> Generated: 2026-09-20 | Source: Full repository analysis

---

## 1. System Overview

PrepPilot AI is a **full-stack RAG (Retrieval-Augmented Generation) platform** that transforms uploaded academic documents into interactive study tools. It combines 7 learning modes in one workspace: Chat, Summary, MCQ, Flashcards, Interview, Key Points, and Revision Sheets.

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React 19 + Vite 8)       │
│  Tailwind CSS v4 · React Router v7 · Axios          │
│  12 pages · 7 component groups · 3 contexts          │
├─────────────────────────────────────────────────────┤
│                  REST API (/api/v1)                  │
├─────────────────────────────────────────────────────┤
│                  Backend (FastAPI + Python 3.11)     │
│  10 route modules · 5 generators · RAG pipeline     │
├──────────────┬──────────────┬───────────────────────┤
│  SQLite      │  ChromaDB    │  Google Gemini 3.5    │
│  (metadata)  │  (vectors)   │  Flash (LLM)          │
└──────────────┴──────────────┴───────────────────────┘
```

---

## 2. Frontend Architecture

### Stack
- **React 19.2** + **Vite 8** + **Tailwind CSS v4**
- **Router:** react-router-dom v7
- **HTTP:** Axios 1.17
- **Math:** KaTeX + rehype-katex + remark-math
- **Diagrams:** Mermaid 11.17
- **3D:** Three.js 0.185
- **Icons:** Lucide React 1.17

### Entry Point
`frontend/src/main.jsx` → `App.jsx`

### Route Map (`App.jsx`)
| Route | Page | Shell |
|---|---|---|
| `/` | `LandingPage` | None (standalone) |
| `/dashboard` | `Dashboard` | AppShell (Navbar+Sidebar) |
| `/upload` | `UploadPage` | AppShell |
| `/chat` | `ChatPage` | AppShell |
| `/summary` | `SummaryPage` | AppShell |
| `/keypoints` | `KeyPointsPage` | AppShell |
| `/mcqs` | `MCQPage` | AppShell |
| `/flashcards` | `FlashcardsPage` | AppShell |
| `/interview` | `InterviewPage` | AppShell |
| `/revision` | `RevisionPage` | AppShell |
| `/history` | `HistoryPage` | AppShell |
| `/settings` | `SettingsPage` | AppShell |

### Component Tree
```
src/
├── components/
│   ├── canvas/                    # Rich visualizers for chat
│   │   ├── CodeVisualization.jsx      (9 KB)
│   │   ├── ComparisonMatrix.jsx       (4.5 KB)
│   │   ├── ComplexityGraph.jsx        (11 KB)
│   │   ├── InteractiveKnowledgeGraph.jsx (28 KB)
│   │   ├── MathematicalDerivation.jsx (9 KB)
│   │   ├── MermaidDiagram.jsx         (7 KB)
│   │   ├── StepByStepVisualizer.jsx   (21 KB)
│   │   ├── VisualCanvas.jsx           (11 KB)
│   │   └── visualizers/              (sub-visualizers)
│   ├── common/
│   │   ├── MarkdownRenderer.jsx       (9.5 KB)
│   │   └── MathRenderer.jsx           (1.7 KB)
│   ├── companion/                 # AI learning companion UI
│   │   ├── AITutorChat.jsx            (16 KB)
│   │   ├── CompactInsightsPanel.jsx   (13 KB)
│   │   ├── LearnerProfileHUD.jsx      (10 KB)
│   │   ├── LearningLoopTracker.jsx    (5 KB)
│   │   ├── SmartNotesPanel.jsx        (12 KB)
│   │   ├── TutorDecisionBanner.jsx    (4 KB)
│   │   └── WhyRecommendationBadge.jsx (9.5 KB)
│   ├── effects/
│   │   ├── LightPillar.jsx            (12.5 KB)
│   │   └── LightPillar.css            (0.3 KB)
│   ├── layout/
│   │   ├── AppShell.jsx               (1.3 KB)
│   │   ├── Navbar.jsx                 (5.5 KB)
│   │   └── Sidebar.jsx                (7 KB)
│   ├── math/
│   │   └── MathExplanationRenderer.jsx (11 KB)
│   └── navigator/
│       └── StudyNavigator.jsx         (16.5 KB)
├── contexts/
│   ├── DocumentContext.jsx        # Active document state
│   ├── LearnerProfileContext.jsx  # Learner archetype/profile
│   └── ThemeContext.jsx           # Dark/light mode toggle
├── services/
│   ├── api.js                     # Axios instance (base URL)
│   ├── chatService.js             # /chat/ API calls
│   ├── companionService.js        # ⚠️ 37KB hardcoded mock data
│   ├── documentService.js         # /documents/ API calls
│   ├── interviewService.js        # /interview/ API calls
│   └── studyService.js            # /summary, /mcqs, /flashcards, /revision, /keypoints
└── pages/                         # 12 page components (see Route Map)
```

### Context Providers
1. **ThemeContext** — dark/light mode toggle, persists to localStorage
2. **DocumentContext** — active document selection, document list, upload state
3. **LearnerProfileContext** — student archetype tracking, mastery metrics

---

## 3. Backend Architecture

### Stack
- **FastAPI 0.111** + **Uvicorn 0.29** + **Python 3.11+**
- **ORM:** SQLAlchemy 2.0 (async with aiosqlite)
- **Validation:** Pydantic v2 + pydantic-settings
- **Vector DB:** ChromaDB (PersistentClient)
- **LLM:** Google GenAI SDK (`google-genai 2.7.0`) → Gemini 3.5 Flash
- **Rate Limiting:** SlowAPI 0.1.9
- **Doc Processing:** pypdf, python-docx

### Entry Point
`backend/main.py` → `app.main:app`

### Module Layout
```
backend/
├── main.py                     # Uvicorn entrypoint
├── app/
│   ├── main.py                 # FastAPI app factory, lifespan, CORS, router
│   ├── config.py               # Settings (pydantic-settings, .env)
│   ├── api/
│   │   ├── deps.py             # Shared dependencies (DB session, services)
│   │   └── routes/
│   │       ├── __init__.py     # Router aggregation (10 sub-routers)
│   │       ├── upload.py       # POST /upload/ — multipart file + background task
│   │       ├── documents.py    # GET/DELETE /documents/
│   │       ├── chat.py         # POST /chat/ — RAG pipeline
│   │       ├── history.py      # GET/DELETE /history/{session_id}
│   │       ├── keypoints.py    # POST /keypoints/ — key concept extraction
│   │       ├── summary.py      # POST/GET /summary/ — 3 summary types
│   │       ├── mcq.py          # POST/GET /mcqs/ — structured exam generation
│   │       ├── flashcards.py   # POST/GET /flashcards/ — card deck generation
│   │       ├── interview.py    # POST /interview/ — mock interview Q&A
│   │       └── revision.py     # POST/GET /revision/ — cheat sheets
│   ├── database/
│   │   └── base.py             # SQLAlchemy engine + async session factory
│   ├── middleware/
│   │   └── rate_limiter.py     # SlowAPI limiter instance
│   ├── models/
│   │   ├── document.py         # Document ORM model
│   │   ├── chat_history.py     # ChatHistory ORM model
│   │   ├── generated_content.py # GeneratedContent ORM model (polymorphic cache)
│   │   └── flashcard.py        # Flashcard ORM model
│   ├── schemas/
│   │   ├── chat.py             # ChatRequest/ChatResponse
│   │   ├── document.py         # DocumentResponse
│   │   ├── flashcard.py        # FlashcardRequest/Response
│   │   ├── interview.py        # InterviewRequest/Response
│   │   ├── mcq.py              # MCQRequest/Response
│   │   └── summary.py          # SummaryRequest/Response
│   └── services/
│       ├── generators/
│       │   ├── flashcard_generator.py
│       │   ├── interview_generator.py
│       │   ├── mcq_generator.py
│       │   ├── revision_generator.py
│       │   └── summary_generator.py
│       ├── llm/
│       │   └── gemini_client.py     # 24KB — core Gemini wrapper (all generation methods)
│       └── rag/
│           ├── chunker.py           # Word-level sliding window chunker
│           ├── document_processor.py # PDF/DOCX/TXT text extraction
│           ├── embeddings.py        # Gemini embedding service
│           ├── retriever.py         # Vector similarity search
│           └── vector_store.py      # ChromaDB collection management
```

### Database Schema (SQLite)
| Table | PK | Key Columns |
|---|---|---|
| `documents` | UUID | filename, file_type, status (processing/ready/error), chunk_count, metadata_json |
| `chat_history` | UUID | document_id (FK), session_id, question, answer, sources (JSON) |
| `generated_content` | UUID | document_id (FK), content_type, subtype, generated_text, model_used |
| `flashcards` | UUID | document_id (FK), deck_name, front, back, difficulty |

### API Surface (`/api/v1`)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /upload/ | File upload + background RAG indexing |
| GET | /documents/ | List all documents |
| GET | /documents/{id} | Single document metadata |
| DELETE | /documents/{id} | Delete document + vectors + DB records |
| POST | /chat/ | RAG-grounded Q&A with Gemini |
| GET | /history/{session_id} | Fetch chat history |
| DELETE | /history/{session_id} | Clear chat history |
| POST | /summary/ | Generate/fetch summary (3 types) |
| GET | /summary/{doc_id} | Cached summaries |
| POST | /mcqs/ | Generate MCQ exam |
| GET | /mcqs/{doc_id} | Cached MCQ sets |
| POST | /flashcards/ | Generate flashcard deck |
| GET | /flashcards/{doc_id} | Cached flashcards |
| POST | /interview/ | Mock interview questions |
| POST | /keypoints/ | Key concept extraction |
| POST | /revision/ | Revision cheat sheet |
| GET | /revision/{doc_id} | Cached revision sheets |

---

## 4. Data Flow

### Document Upload → RAG Pipeline
```
User drops file → POST /upload/ → save to disk → create Document record (status=processing)
  → BackgroundTask:
    1. DocumentProcessor extracts text (PDF/DOCX/TXT)
    2. Chunker splits into 500-word windows with 100-word overlap
    3. EmbeddingService encodes chunks via Gemini Embedding API
    4. VectorStore creates ChromaDB collection (doc_{uuid}), stores chunks + embeddings
    5. Update Document status → ready (or error)
```

### Chat (RAG Query)
```
User sends question + document_id → POST /chat/
  → EmbeddingService encodes question
  → Retriever queries ChromaDB collection (top-K=5 similar chunks)
  → GeminiClient builds prompt: system instructions + retrieved context + chat history + question
  → Gemini generates grounded answer with citations
  → Save to chat_history table
  → Return answer + source citations to frontend
```

---

## 5. Configuration

### Environment Variables (`.env`)
| Variable | Purpose | Default |
|---|---|---|
| GEMINI_API_KEY | Google AI API key | (required) |
| GEMINI_MODEL | LLM model name | gemini-3.5-flash |
| EMBEDDING_MODEL | Embedding model | gemini-embedding-001 |
| DATABASE_URL | SQLite connection | sqlite+aiosqlite:///./preppilot.db |
| CHROMA_PERSIST_DIR | Vector DB path | ./chroma_db |
| UPLOAD_DIR | File storage | ./uploads |
| ALLOWED_ORIGINS | CORS origins | localhost:5173, localhost:3000, vercel |

### Docker
- `docker-compose.yml` — 2 services (backend:8000, frontend:3000)
- `docker/Dockerfile.backend` + `docker/Dockerfile.frontend`

---

## 6. Known Issues & Tech Debt

### Critical
1. **ChatPage uses hardcoded mocks** — `companionService.js` (37KB) has static CS topic data instead of connecting to real `/chat/` API
2. **No document status polling** — uploaded docs stuck in "processing" until manual refresh

### Moderate
3. **Settings page broken** — API URL saved to localStorage but `api.js` ignores it
4. **No regeneration** — cached study content can't be regenerated
5. **Flashcard ratings lost** — stored only in React state, lost on refresh
6. **Markdown parsing bugs** — custom regex splitters in Summary/Revision pages

### Low
7. **Duplicate dependency** — `httpx` listed twice in requirements.txt
8. **Both pypdf and PyPDF2** in requirements (redundant)
9. **No auth** — single-user, no multi-tenancy yet (roadmap item)
