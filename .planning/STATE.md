# PrepPilot AI — State Tracker

## Current State

- **Active Milestone:** 1 — Stabilize & Fix
- **Active Phase:** 5 — ✅ Complete
- **Branch:** `abhishek-changes`
- **Last Commit:** `cfbd05f` — feat: persist flashcard ratings and improve review workflow
- **Uncommitted:** Phase 5 code changes

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 1 | Fix Chat Page — Harden & Complete | ✅ Done |
| 2 | Fix Upload Polling & Document State | ✅ Done |
| 3 | Fix Settings & API Configuration | ✅ Done |
| 4 | Fix Flashcard Persistence | ✅ Done |
| 5 | Fix Markdown & Content Rendering | ✅ Done |
| 6 | Add Regeneration Capability | ⬜ Not Started |

## Decision Log

| # | Decision | Context | Date |
|---|---|---|---|
| 1 | GSD onboarding initialized | Codebase mapped, planning structure created | 2026-09-20 |
| 2 | Phase 1 scope: 5 tasks (fallback, visual payload, history, clear, grounding badge) | ChatPage already connected to real API | 2026-09-20 |
| 3 | No-document mode: hybrid approach | Allow general questions, mark as ungrounded | 2026-09-20 |
| 4 | Phase 1 execution complete | All 5 tasks implemented, build verified | 2026-09-20 |
| 5 | Phase 2: allow selecting processing docs with warning banner | User preference | 2026-09-20 |
| 6 | Phase 2: error state shows Re-upload + Delete, not "Retry" | Can't reprocess without re-uploading | 2026-09-20 |
| 7 | Phase 2: add toast notifications on processing complete | User preference | 2026-09-20 |
| 8 | Phase 2 execution complete | All 6 tasks implemented, build verified | 2026-09-20 |
| 9 | Phase 3: live health & system info routes | `/api/v1/health` and `/api/v1/system/info` | 2026-09-20 |
| 10 | Phase 3: URL normalizer with duplicate `/api/v1` prevention | Normalizes schemes, trailing slashes, and endpoints | 2026-09-20 |
| 11 | Phase 3: Learner persona integrated in Settings | Wired to `LearnerProfileContext` archetypes | 2026-09-20 |
| 12 | Phase 3: Granular resets with scoped localStorage cleanup | Clear only PrepPilot-owned keys on app reset | 2026-09-20 |
| 13 | Phase 3 execution complete | All tasks implemented, build & API verified | 2026-09-20 |
| 14 | Phase 4: SQLite backend as source of truth for flashcard ratings | PATCH `/api/v1/flashcards/{id}/rating` with optimistic rollback | 2026-09-20 |
| 15 | Phase 4: Mastered defined as Easy, with Hard/Medium review-needed | Initial cards default to `unreviewed` | 2026-09-20 |
| 16 | Phase 4: Never auto-regenerate saved decks | Resume Deck view with progress stats, explicit generation action | 2026-09-20 |
| 17 | Phase 4: All, Hard, Unreviewed study filter modes | Cockpit UI with keyboard navigation shortcuts [1/2/3/Space] | 2026-09-20 |
| 18 | Phase 4 execution complete | All tasks implemented, build & API verified | 2026-09-20 |
| 19 | Phase 5: remark-gfm installed and integrated | Markdown tables enabled with custom cockpit styling and scrolling | 2026-09-20 |
| 20 | Phase 5: LaTeX bracket normalization | `\[...\]` -> `$$...$$` and `\(...\)` -> `$...$` | 2026-09-20 |
| 21 | Phase 5: Currency disambiguation | Standalone `$100` escaped to `\$100`, preserving math like `$10 + x = 20$` | 2026-09-20 |
| 22 | Phase 5: Standardized KeyPointsPage on MarkdownRenderer | Concept titles & memory tips render KaTeX/Markdown | 2026-09-20 |
| 23 | Phase 5: KaTeX overflow scroll styling | Custom cyan scrollbar for wide equations | 2026-09-20 |
| 24 | Phase 5 execution complete | All tasks implemented, build & rendering verified | 2026-09-20 |

## Blockers

None currently identified.
