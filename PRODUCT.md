# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and learners preparing for exams, job interviews, or technical assessments. They upload their own study materials (PDFs, DOCX, TXT) and use AI-generated tools to convert passive reading into active, structured preparation.

## Product Purpose

PrepPilot AI transforms raw educational documents into structured, interactive learning tools: context-grounded chat, automated summaries, MCQ exams, spaced-repetition flashcards, recruiter-simulated mock interviews, key-point extraction, and revision sheets. Success means a learner can go from an uploaded document to a confident exam or interview performance without needing any other tool.

## Positioning

PrepPilot is a single-workspace RAG study companion: unlike generic chatbots it is grounded exclusively in the user's own uploaded corpus, and unlike static quiz tools it combines retrieval-augmented conversation, exam generation, flashcards, and mock interviewing in one coherent session. No other tool in scope combines all seven learning modes against a user's private document set.

## Operating Context

- Users upload documents (PDF, DOCX, TXT) from desktop
- Sessions are persistent (SQLite-backed chat history, Chroma vector store)
- Likely used at a desk, full-screen or large viewport, during focused study sessions
- Dark mode is a first-class expectation for late-night study sessions
- Users may paste job descriptions and resume text directly into interview flows
- Math-heavy content (KaTeX rendering) is a confirmed use case

## Capabilities and Constraints

- Stack: React 18 + Vite + Tailwind CSS v4 (frontend), FastAPI + Python 3.11 (backend), Google Gemini 2.5 Flash (LLM), ChromaDB (vector store), SQLite (metadata + history), Docker Compose (deployment)
- Embedding model: `all-MiniLM-L6-v2` (sentence-transformers)
- File types: PDF, DOCX, TXT
- Chunk size: 500 tokens, overlap 100
- Top-K retrieval: 5
- Math rendering: KaTeX
- Authentication: none in current version (single-user, local/self-hosted); JWT multi-tenancy is on the roadmap
- All AI generation is document-grounded; no hallucinated claims about content outside the corpus
- Planned: React Flow mind maps, cloud vector DB, SM-2 spaced repetition scheduling, voice mock interviews

## Brand Commitments

- Name: PrepPilot AI
- Typography: Plus Jakarta Sans (body), Outfit (display), JetBrains Mono (code)
- Color: violet/purple brand family (`#8b5cf6` core) with emerald accent (`#10b981`)
- Visual style: glassmorphism, dark mode-first, canvas grid backgrounds, gradient mesh accents
- Tone: intelligent, encouraging, focused — a smart study partner, not a corporate tool

## Evidence on Hand

- Full README with architecture diagram and API reference
- Concept paper (PrepPilot_Concept_Paper.docx) and pitch deck (PrepPilot.pptx) in root
- Existing audit notes (preppilot_audit.md)
- Working codebase with all core features implemented

## Product Principles

1. **Document-grounded truth** — every AI output is anchored in the user's uploaded content; fabrication is never acceptable.
2. **Seven modes, one workspace** — chat, summary, MCQ, flashcards, interview, key points, and revision sheets are seamlessly accessible without context-switching.
3. **Active over passive** — every feature converts reading into doing: quizzes, cards, drills, and simulations rather than plain summaries.
4. **Study-session ergonomics** — dark mode, keyboard-friendly navigation, and fast response times matter because users are in focused, often late-night sessions.
5. **Grow without breaking** — the architecture (RAG + vector DB + LLM abstraction) must support multi-tenancy, cloud storage, and voice without redesigning core flows.

## Accessibility & Inclusion

WCAG AA compliance. Color contrast ratios must meet 4.5:1 for body text, 3:1 for UI components. All interactive elements must be keyboard-navigable and screen-reader labeled.
