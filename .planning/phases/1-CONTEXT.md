# Phase 1 — Context & Decisions

> **Phase:** Fix Chat Page — Remove Mocks, Connect RAG  
> **Discussed:** 2026-09-20  
> **Status:** Ready for planning

---

## Key Discovery

**ChatPage.jsx is already connected to the real API** via `chatService.query()` (line 171). The `companionService.js` (37KB hardcoded mock) exists as dead code but is no longer imported by ChatPage. The `context.md` audit was describing the pre-refactor state.

This means Phase 1 is NOT about "connecting the API" — it's about **hardening and completing** the chat feature.

---

## Scope — 5 Items

### 1. Fix Gemini Fallback (Backend)
**Problem:** When `generate_companion_response()` structured JSON generation fails, the fallback at `gemini_client.py:200-214` returns hardcoded CS formulas (`$T(n) = T(n/2) + O(1)$`) regardless of the actual student topic.

**Decision:** Replace the hardcoded fallback with dynamic content derived from the actual `generate_answer()` text response. Extract the first formula/concept from the answer text, or return empty arrays. Never return topic-inappropriate formulas.

### 2. Load Chat History on Mount (Frontend)
**Problem:** ChatPage starts empty on every page load. The backend stores history in `chat_history` table, and `chatService.getHistory(sessionId)` exists but is never called.

**Decision:** On mount, call `chatService.getHistory(sessionId)` and populate the messages array. Map the history response format (`ChatHistoryResponse`) to the local message format used by ChatPage.

### 3. Wire Clear History to Backend (Frontend)
**Problem:** `handleClearHistory()` at ChatPage line 218-225 only clears local React state. The DB records remain.

**Decision:** Call `chatService.clearHistory(sessionId)` before clearing local state. Also generate a new session ID so the cleared history doesn't reload on next mount. Show a brief toast/confirmation.

### 4. Handle "No Document" Mode — Hybrid (Frontend + Backend)
**Problem:** When no document is selected, the chat still works but there's no visual distinction between grounded and ungrounded answers.

**Decision: Hybrid approach.**
- Allow general questions without a document selected.
- AI answers from general knowledge (backend already supports `document_id=None`).
- Visually differentiate ungrounded responses:
  - Add a subtle banner/badge on AI responses: "⚠ General knowledge — not grounded in a document"
  - Hide the "Document Sources" section (since there are none).
  - Show a persistent gentle CTA: "Upload a document for cited, grounded answers"
- Source citations are already hidden when `sources` is empty (line 450), so no change needed there.

### 5. Fix Visual Payload Pipeline (Backend)
**Problem:** The Gemini structured JSON schema requests `visual_type` but NOT `visual_payload`. The `chat.py` route reads `companion_result.get("visual_payload")` which is always `None`. So the Visual Canvas never receives data from the backend.

**Decision:** Add `visual_payload` to the Gemini response schema so the LLM generates the actual payload data (title, steps, derivation, etc.) alongside `visual_type`. Match the payload structure to what `VisualCanvas.jsx` expects. If adding the full payload schema is too complex or causes Gemini failures, generate `visual_payload` as a follow-up call or set it to a lightweight skeleton that the frontend can render.

---

## Out of Scope (Deferred)

- **Delete `companionService.js`** — user chose to keep it for now (may have reference value)
- **Redesign ChatPage layout** — current layout works fine after the refactor
- **Add new tutor modes** — 5 modes already exist and work
- **Streaming responses** — future enhancement

---

## Files to Modify

| File | Change |
|---|---|
| `backend/app/services/llm/gemini_client.py` | Fix fallback response, add visual_payload to Gemini schema |
| `frontend/src/pages/ChatPage.jsx` | Add history loading on mount, wire clear history to backend, add ungrounded response visual differentiation |
| `frontend/src/services/chatService.js` | No changes needed (already complete) |

---

## Next Step

→ `/gsd-plan-phase 1` to create the detailed implementation plan with file-level changes.
