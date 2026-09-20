# PrepPilot AI — Roadmap

## Milestone 1: Stabilize & Fix (Current)

> **Goal:** Fix all broken features, remove hardcoded mocks, and make every existing feature fully operational end-to-end.

### Phase 1: Fix Chat Page — Remove Mocks, Connect RAG ⬜
- Replace `companionService.js` mock data with real `/api/v1/chat/` integration
- Redesign ChatPage into clean, document-grounded Socratic AI companion
- Add pedagogical tutor mode support (Socratic, Direct, Exam Cram, ELI5, Step-by-Step)
- Add source citations with page numbers and relevance scores
- Wire `chatService.js` to real backend endpoints

### Phase 2: Fix Upload Polling & Document State ⬜
- Add auto-polling in DocumentContext for `processing` → `ready` status transition
- Remove need for manual page refresh after upload
- Add upload progress feedback

### Phase 3: Fix Settings & API Configuration ⬜
- Update `api.js` to read from `localStorage` with fallback to `VITE_API_URL`
- Make Settings page actually functional

### Phase 4: Fix Flashcard Persistence ⬜
- Persist card ratings to localStorage (or backend)
- Add "Review Hard Cards" filter mode
- Prepare for SM-2 spaced repetition scheduling

### Phase 5: Fix Markdown & Content Rendering ⬜
- Replace buggy regex string-splitters in SummaryPage and RevisionPage
- Ensure unified MarkdownRenderer + KaTeX is used across all study pages
- Verify math rendering works for LaTeX formulas

### Phase 6: Add Regeneration Capability ⬜
- Add "Regenerate / New Set" button to Summary, MCQ, Revision, and Key Points pages
- Backend support for force-refresh bypassing cache

---

## Milestone 2: Polish & UX Excellence ⬜

> **Goal:** Elevate the UI/UX to premium quality, fix cognitive overload, and make the app visually stunning.

### Phase 7: UI Redesign — Dashboard & Landing ⬜
### Phase 8: UI Redesign — Study Tools Pages ⬜
### Phase 9: Accessibility & WCAG AA Compliance ⬜
### Phase 10: Mobile Responsive Optimization ⬜

---

## Milestone 3: Advanced Features ⬜

> **Goal:** Add planned advanced capabilities from the roadmap.

### Phase 11: Multi-tenancy & Authentication (JWT) ⬜
### Phase 12: Cloud Vector DB Migration ⬜
### Phase 13: SM-2 Spaced Repetition Algorithm ⬜
### Phase 14: React Flow Mind Maps ⬜
### Phase 15: Voice Mock Interviews ⬜

---

## Backlog

- Performance optimization (lazy loading, code splitting)
- Export study materials as PDF
- Shared study sessions
- Analytics dashboard (study time, quiz scores over time)
- Integration with Google Drive / Dropbox for document upload
- Mobile app (React Native)
