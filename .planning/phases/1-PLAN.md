# Phase 1 — Implementation Plan

> **Phase:** Fix Chat Page — Harden & Complete  
> **Created:** 2026-09-20  
> **Context:** [1-CONTEXT.md](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/.planning/phases/1-CONTEXT.md)

---

## Plan Overview

5 tasks across 2 files. No new files needed. No schema/API changes required.

**Dependency order:** Tasks 1 → 5 are independent and can be executed in any order, but Task 5 (visual payload) builds on top of Task 1 (fallback fix) since both modify `gemini_client.py`.

---

## Task 1: Fix Gemini Fallback Response

**File:** [`gemini_client.py`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/backend/app/services/llm/gemini_client.py#L200-L214)

**Problem:** Lines 200-214 — when `generate_companion_response()` fails structured generation, the fallback returns hardcoded Binary Search formulas (`$T(n) = T(n/2) + O(1)$`) regardless of the actual student topic.

**Change:**
Replace the hardcoded fallback dict at lines 203-214 with a dynamic one:
```python
# BEFORE (hardcoded):
return {
    "answer": text_ans,
    "prerequisite_diagnosis": "Analyzed foundational prerequisites for topic.",
    "visual_type": "mathematical_derivation",
    "smart_notes": {
        "formulas": ["$T(n) = T(n/2) + \\mathcal{O}(1)$", ...],
        ...
    },
    "followup_questions": ["Can you explain the mathematical derivation?", ...]
}

# AFTER (dynamic):
return {
    "answer": text_ans,
    "prerequisite_diagnosis": None,
    "visual_type": None,
    "visual_payload": None,
    "smart_notes": {
        "formulas": [],
        "prerequisites": [],
        "key_takeaways": [text_ans[:200] + "..." if len(text_ans) > 200 else text_ans],
        "pitfalls": []
    },
    "followup_questions": [
        "Can you explain this in more detail?",
        "What are the key takeaways?"
    ]
}
```

**Rationale:** The fallback now returns empty/generic content rather than topic-inappropriate CS formulas. The answer itself (from `generate_answer()`) is already topic-appropriate since it uses the real RAG context.

**UAT:** Send a non-CS question (e.g., about biology) while the Gemini structured output is failing → verify no Binary Search formulas appear.

---

## Task 2: Add Visual Payload to Gemini Schema

**File:** [`gemini_client.py`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/backend/app/services/llm/gemini_client.py#L153-L175)

**Problem:** The Gemini structured JSON schema (lines 153-175) includes `visual_type` but not `visual_payload`. The `chat.py` route reads `companion_result.get("visual_payload")` which always returns `None`.

**Change:**
Add `visual_payload` to the response schema at line 161, after `visual_type`:
```python
"visual_payload": {
    "type": "OBJECT",
    "description": "Visual data payload matching visual_type. Include relevant keys like: derivation_title, derivation_steps, derivation_conclusion, prerequisites (for mathematical_derivation); mermaid_code, diagram_title (for diagram/flowchart/concept_map/timeline); comparison_title, comparison_columns, comparison_rows (for comparison); code_title, code_lines, trace_steps (for code_visualization); graph_title (for graph); array, target, title (for step_by_step_visualization).",
    "properties": {
        "title": {"type": "STRING"},
        "visual_type": {"type": "STRING"}
    },
    "required": ["title", "visual_type"]
},
```

The schema is intentionally loose (`OBJECT` with minimal required fields) because:
- Gemini fills in additional properties based on the `visual_type` selection
- The `VisualCanvas` components use optional chaining (`visualPayload?.derivation_steps || undefined`) so missing keys are safe
- Being too strict risks more structured generation failures

Also update the system instruction prompt (line 148-150) to mention the payload keys:
```python
"When selecting a visual_type, also populate visual_payload with the data needed to render it. "
"For mathematical_derivation: include derivation_title, prerequisites, derivation_steps (array of {stepNumber, title, latex, annotation, explanation}), derivation_conclusion. "
"For diagram/flowchart/concept_map/timeline: include diagram_title, mermaid_code (valid Mermaid.js syntax). "
"For comparison: include comparison_title, comparison_columns, comparison_rows. "
"For code_visualization: include code_title, code_lines, trace_steps. "
"For step_by_step_visualization: include title, array, target. "
"For graph: include graph_title.\n"
```

**Rationale:** This teaches Gemini what payload structure each visual_type expects, enabling the VisualCanvas to render real AI-generated content instead of hardcoded defaults.

**UAT:** Ask "Derive the quadratic formula step by step" → verify `visual_payload` in the response contains `derivation_steps` and the VisualCanvas renders it.

---

## Task 3: Load Chat History on Mount

**File:** [`ChatPage.jsx`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/frontend/src/pages/ChatPage.jsx#L152-L159)

**Problem:** ChatPage starts empty every time. History exists in the backend but is never loaded.

**Change:**
Add a `useEffect` after the existing mount effects (after line 159):
```jsx
// Load previous chat history from backend
useEffect(() => {
  const loadHistory = async () => {
    try {
      const history = await chatService.getHistory(sessionId);
      if (history && history.length > 0) {
        const restored = [];
        for (const h of history) {
          restored.push({ role: "user", text: h.question });
          restored.push({
            role: "ai",
            text: h.answer,
            sources: h.sources || [],
            followup_questions: []
          });
        }
        setMessages(restored);
      }
    } catch (err) {
      console.warn("Could not load chat history:", err);
      // Non-blocking — start fresh if history load fails
    }
  };
  loadHistory();
}, [sessionId]);
```

**Mapping:** The backend `ChatHistoryResponse` has `{ question, answer, sources, document_id, timestamp }`. We map each history entry into two messages (user + ai) matching the local message format.

**UAT:** 
1. Send a few messages in chat → navigate away → come back → verify messages are restored
2. Clear browser and create new session → verify no messages load (empty state shows)

---

## Task 4: Wire Clear History to Backend

**File:** [`ChatPage.jsx`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/frontend/src/pages/ChatPage.jsx#L218-L225)

**Problem:** `handleClearHistory()` only clears local React state. DB records persist and would reload on next mount (after Task 3).

**Change:**
Replace the `handleClearHistory` function:
```jsx
const handleClearHistory = async () => {
  if (!window.confirm("Reset this study session and clear chat history?")) return;
  
  try {
    await chatService.clearHistory(sessionId);
  } catch (err) {
    console.warn("Could not clear backend history:", err);
  }
  
  // Clear local state
  setMessages([]);
  setVisualPayload(null);
  setShowCanvas(false);
  setError("");
  
  // Generate a new session ID so cleared history doesn't reload
  const newSession = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("preppilot_chat_session", newSession);
  // Note: sessionId is from useState initializer, so we need to force a re-render
  // The simplest approach: reload the component by navigating
  window.location.reload();
};
```

**Alternative (no reload):** Make `sessionId` a state setter instead of initializer-only:
```jsx
// Change line 130 from:
const [sessionId] = useState(() => { ... });
// To:
const [sessionId, setSessionId] = useState(() => { ... });

// Then in handleClearHistory, instead of window.location.reload():
setSessionId(newSession);
```

**Decision:** Use the `setSessionId` approach — cleaner, no page reload.

**Changes needed:**
1. Line 130: Add `setSessionId` to destructured state
2. Lines 218-225: Replace with async version that calls backend + resets session ID

**UAT:**
1. Send messages → click clear → confirm messages are gone
2. Navigate away → come back → verify no old messages reload
3. Verify new session ID is in localStorage

---

## Task 5: Hybrid No-Document Mode

**File:** [`ChatPage.jsx`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/frontend/src/pages/ChatPage.jsx#L386-L478)

**Problem:** When no document is selected, AI responses look identical to grounded ones. Users can't tell the difference.

**Change:**
In the message bubble rendering (lines 397-478), add visual differentiation for ungrounded responses:

1. **Track grounding per-message.** When creating the AI message object in `sendMessage()` (line 179-188), add:
```jsx
const aiMsg = {
  role: "ai",
  text: response.answer || "",
  sources: response.sources || [],
  isGrounded: !!(activeDocument && response.sources && response.sources.length > 0),
  // ... rest of fields
};
```

2. **Show ungrounded badge.** In the AI header section (line 397-411), add after the mode badge:
```jsx
{!msg.isGrounded && msg.role === "ai" && (
  <span className="ml-2 inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-medium">
    <HelpCircle className="w-2.5 h-2.5" />
    <span>General knowledge</span>
  </span>
)}
```

3. **Existing behavior already handles the rest:**
   - Source citations are already hidden when `sources` is empty (line 450: `msg.sources && msg.sources.length > 0`)
   - The "No document selected" banner already shows (line 333-344)
   - The backend already supports `document_id=None` — it just skips RAG retrieval and answers from general knowledge

**UAT:**
1. With no document selected, ask "What is photosynthesis?" → verify "General knowledge" badge appears, no source cards
2. With a document selected, ask a question → verify no badge, source cards appear
3. Verify the existing amber "No document selected" banner still shows at top

---

## File Change Summary

| File | Lines Modified | Tasks |
|---|---|---|
| [`gemini_client.py`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/backend/app/services/llm/gemini_client.py) | ~30 lines | Task 1 (fallback), Task 2 (visual_payload schema) |
| [`ChatPage.jsx`](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/frontend/src/pages/ChatPage.jsx) | ~50 lines | Task 3 (history load), Task 4 (clear history), Task 5 (grounding badge) |

**Total estimated change:** ~80 lines across 2 files.

---

## Verification Plan

### Automated
```bash
# Backend: verify no import/syntax errors
cd backend && python -c "from app.services.llm.gemini_client import GeminiClient; print('OK')"

# Frontend: verify build succeeds
cd frontend && npm run build
```

### Manual (with running backend)
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Run through each UAT check listed per task above

---

## Execution Order

1. **Task 1 + Task 2** — both in `gemini_client.py`, do together
2. **Task 3** — add history loading
3. **Task 4** — wire clear history (depends on Task 3's pattern)
4. **Task 5** — add grounding badge
5. **Verify** — build check + manual UAT
