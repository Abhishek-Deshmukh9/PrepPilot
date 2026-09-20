# PrepPilot AI — Onboarding Summary

> **Onboarded:** 2026-09-20 | **Method:** Full codebase analysis + doc ingest

---

## What Was Learned

### Architecture
- Full-stack RAG platform: React 19 + Vite 8 frontend, FastAPI + Python backend
- 12 frontend pages, 10 backend route modules, 5 content generators
- SQLite for metadata, ChromaDB for vectors, Gemini 3.5 Flash for LLM
- Clean separation: routes → schemas → services → generators → LLM/RAG

### Features (7 Learning Modes)
1. ✅ Document Upload & RAG Pipeline (fully operational)
2. ⚠️ AI Chat (backend works, frontend uses hardcoded mocks)
3. ✅ Summaries (3 types, cached)
4. ✅ MCQ Exams (configurable count/difficulty)
5. ✅ Flashcards (3D flip, but ratings not persisted)
6. ✅ Mock Interview (resume + JD based)
7. ✅ Key Points (backend + frontend exist)
8. ✅ Revision Sheets (with markdown bugs)

### Documents Ingested
- `PRODUCT.md` — product schema with brand, capabilities, principles
- `context.md` — 19KB comprehensive architectural analysis & improvement plan
- `preppilot_audit.md` — 21KB line-by-line source code audit
- `README.md` — 12KB project readme
- `REFACTOR_CHANGELOG.md` — change log from recent refactoring

### Key Issues Identified
| Priority | Issue | Impact |
|---|---|---|
| 🔴 Critical | Chat page disconnected from real RAG API | Core feature broken |
| 🔴 Critical | No document status polling | UX broken after upload |
| 🟡 Moderate | Settings page non-functional | Config doesn't apply |
| 🟡 Moderate | No content regeneration | Users stuck with first result |
| 🟡 Moderate | Flashcard ratings ephemeral | Study progress lost |
| 🟡 Moderate | Markdown rendering bugs | Broken display |

---

## Planning Artifacts Created

| File | Purpose |
|---|---|
| `.planning/codebase/ARCHITECTURE.md` | Full architecture map (frontend, backend, DB, API, data flow) |
| `.planning/PROJECT.md` | Project identity, vision, stack, principles, decisions |
| `.planning/REQUIREMENTS.md` | Functional + non-functional requirements with status |
| `.planning/ROADMAP.md` | 3-milestone roadmap with 15 phases |
| `.planning/STATE.md` | Active milestone/phase tracker, decision log |
| `.planning/onboarding/SUMMARY.md` | This file |

---

## Recommended Next Command

**`/gsd-discuss-phase`** — Begin Phase 1 (Fix Chat Page — Remove Mocks, Connect RAG) to tackle the most critical broken feature first.

Alternatively:
- `/gsd-plan-phase 1` — Jump straight to planning Phase 1
- `/gsd-fast` — Do a quick fix for any specific bug
- `/gsd-ui-review` — Audit the frontend visuals before fixing logic
