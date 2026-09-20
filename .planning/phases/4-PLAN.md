# Phase 4 — Implementation Plan: Fix Flashcard Persistence & Review Workflow

> **Phase:** 4 — Fix Flashcard Persistence  
> **Created:** 2026-09-20  
> **Context:** [4-CONTEXT.md](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/.planning/phases/4-CONTEXT.md)  
> **Status:** Ready for Review  

---

## Plan Overview

Implement persistent ratings, deck resumption, study filters, and polished review UI across backend and frontend:
1. **Backend Schema & Route**: Add `FlashcardRatingUpdate` schema and `PATCH /api/v1/flashcards/{card_id}/rating` endpoint.
2. **Frontend Service**: Add `studyService.updateFlashcardRating(cardId, difficulty)`.
3. **Deck Resume & Hydration**: Automatically check for existing cards on document switch, offering a resume option with progress stats.
4. **Enhanced Flashcard Controls & Filters**:
   - Filter bar: All, Hard / Need Review, Unreviewed.
   - Distinctive Easy / Medium / Hard rating buttons with active indicator.
   - Real-time mastery bar (% mastered) and count badges.
   - Useful empty states for filtered modes.
   - Completion celebration screen with "Study Hard Cards" action.

---

## Task Breakdown

### Task 1: Backend Rating Schema & PATCH Endpoint
**Files:**
- `backend/app/schemas/flashcard.py` [MODIFY]
- `backend/app/api/routes/flashcards.py` [MODIFY]

**Changes:**
- In `schemas/flashcard.py`:
  - Define `FlashcardRatingUpdate(BaseModel)` with `difficulty: Literal["easy", "medium", "hard"]` (or `str` with regex validation).
- In `api/routes/flashcards.py`:
  - Add `PATCH /{card_id}/rating` accepting `FlashcardRatingUpdate`.
  - Fetch card by `card_id`, update `card.difficulty = request.difficulty`, commit to SQLite DB.
  - Return updated `FlashcardResponse` or 404 if card not found.

---

### Task 2: Frontend Study Service Method
**File:**
- `frontend/src/services/studyService.js` [MODIFY]

**Changes:**
- Add `updateFlashcardRating(cardId, difficulty)`:
  ```javascript
  async updateFlashcardRating(cardId, difficulty) {
    const response = await apiClient.patch(`/flashcards/${cardId}/rating`, {
      difficulty,
    });
    return response.data;
  }
  ```

---

### Task 3: Deck Resume & Preload Hydration in FlashcardsPage
**File:**
- `frontend/src/pages/FlashcardsPage.jsx` [MODIFY]

**Changes:**
- On mount / document change, call `studyService.getFlashcards(activeDocument.id)`.
- If cards exist:
  - Cache them in state `existingCards`.
  - Calculate mastery counts (easy, medium, hard, unrated).
  - Show a "Resume Deck" hero card with deck name, card count, mastery bar, "Resume Review" button, and a secondary "Generate New Deck" toggle.
- If no cards exist: show the initial generator form.

---

### Task 4: Filter Modes (All / Hard / Unreviewed) & Empty States
**File:**
- `frontend/src/pages/FlashcardsPage.jsx` [MODIFY]

**Changes:**
- Add filter state: `filterMode` (`"all"` | `"hard"` | `"unreviewed"`).
- Compute `filteredCards = cards.filter(...)`.
- Useful empty states:
  - In `"hard"` mode when 0 cards are hard: "No cards marked as hard yet! Rate difficult cards as 'Hard' to review them here." with button to return to All Cards.
  - In `"unreviewed"` mode when all cards are rated: "All cards in this deck have been reviewed!" with button to restart review or review hard cards.

---

### Task 5: Enhanced Rating Controls & Mastery Progress UI
**File:**
- `frontend/src/pages/FlashcardsPage.jsx` [MODIFY]

**Changes:**
- **Mastery Progress Header**:
  - Displays: Total progress bar, percentage mastered (% rated easy), and count badges:
    - Easy: Emerald badge with check icon
    - Medium: Amber badge
    - Hard: Rose badge with flame/alert icon
    - Filter tabs with counts
- **Rating Controls**:
  - Ergonomic 3-button layout:
    - **Hard** (Rose button with icon / hotkey 1)
    - **Medium** (Amber button with icon / hotkey 2)
    - **Easy** (Emerald button with icon / hotkey 3)
  - Shows which rating is currently selected.
  - Optimistically updates React state & `localStorage` cache.
  - Dispatches `studyService.updateFlashcardRating` in background.
  - Automatically advances to next card after brief transition.
- **Deck Completion Screen**:
  - Shown when user reaches the end of the deck or clicks Finish.
  - Displays summary statistics (X Mastered, Y Need Review).
  - Quick action buttons: "Review Hard Cards" (if any hard cards exist) or "Restart Deck".

---

### Task 6: Verification & Validation
- Backend import & route check with venv python.
- Live test of `PATCH /api/v1/flashcards/{card_id}/rating`.
- Frontend build check with `npm run build`.
