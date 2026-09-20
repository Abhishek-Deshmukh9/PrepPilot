# PrepPilot AI — Project Definition

## Identity

- **Name:** PrepPilot AI
- **Tagline:** Your Personal AI-Powered Study, Revision, and Interview Assistant
- **Version:** 1.0.0
- **Repository:** Abhishek-Deshmukh9/PrepPilot
- **License:** Private

## Vision

Transform raw educational documents into interactive, mastery-driven study materials — enabling any student to go from an uploaded PDF to confident exam or interview performance without needing any other tool.

## Problem Statement

Students spend excessive time passively reading dense academic materials. Existing tools are fragmented: one for quizzes, another for flashcards, another for AI chat — none integrated, none grounded in the student's own documents. Generic AI chatbots hallucinate and lack document citations.

## Solution

A single-workspace RAG study companion that:
1. Ingests the student's own documents (PDF, DOCX, TXT)
2. Grounds ALL AI outputs exclusively in the uploaded content
3. Provides 7 interconnected learning modes in one interface
4. Supports math-heavy content with KaTeX rendering

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS v4 |
| Backend | FastAPI + Python 3.11 |
| LLM | Google Gemini 3.5 Flash (google-genai SDK) |
| Embeddings | gemini-embedding-001 |
| Vector DB | ChromaDB (PersistentClient) |
| Database | SQLite + SQLAlchemy 2.0 (async) |
| Deployment | Docker Compose, Vercel (frontend) |

## Product Principles

1. **Document-grounded truth** — every AI output anchored in user's content
2. **Seven modes, one workspace** — chat, summary, MCQ, flashcards, interview, key points, revision sheets
3. **Active over passive** — converts reading into doing
4. **Study-session ergonomics** — dark mode, keyboard-friendly, fast
5. **Grow without breaking** — architecture supports multi-tenancy, cloud, voice without redesign

## Key Decisions

| Decision | Rationale | Date |
|---|---|---|
| Gemini over OpenAI | Cost-effective, structured JSON output, gemini-embedding-001 for embeddings | 2026-08 |
| ChromaDB over Pinecone | Local-first, no cloud dependency for MVP | 2026-08 |
| SQLite over Postgres | Single-user MVP, minimal ops overhead | 2026-08 |
| Tailwind v4 over v3 | Latest CSS-first approach, better DX | 2026-09 |
| No auth in v1 | Single-user local/self-hosted; JWT planned for v2 | 2026-08 |

## Team

- **Abhishek Deshmukh** — Full-stack developer, product owner

## Links

- Concept Paper: `PrepPilot_Concept_Paper.docx`
- Pitch Deck: `PrepPilot.pptx`
- Product Definition: `PRODUCT.md`
- Architectural Context: `context.md`
- Audit: `preppilot_audit.md`
