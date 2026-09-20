# Phase 4 — Context: Fix Flashcard Persistence & Review Workflow

> **Phase:** 4 — Fix Flashcard Persistence  
> **Created:** 2026-09-20  
> **Status:** Decisions & Scope Finalized  

---

## Decisions & Requirements

1. **Backend Rating Persistence:**
   - Expose `PATCH /api/v1/flashcards/{card_id}/rating` expecting `{"difficulty": "easy" | "medium" | "hard"}`.
   - Updates the existing `difficulty` column on the `Flashcard` table in SQLite.
   - Validates card ID and difficulty string.

2. **Frontend Persistence & Synchronization:**
   - `studyService.updateFlashcardRating(cardId, difficulty)`.
   - Optimistic local update so card advancement and rating feedback are instantaneous.
   - Dual-persistence: saved in SQLite backend and cached in `localStorage` under `preppilot_card_ratings_${docId}` for instant local hydration.

3. **Resume & Review for Existing Decks:**
   - On page mount or document change, check if flashcards already exist for `activeDocument.id`.
   - If cards exist: display a "Resume Deck" view showing deck name, total cards, and mastery breakdown, with a primary "Resume Review" button and a secondary "Generate New Deck" option.
   - If no cards exist: display the deck generation form.

4. **Filter Modes:**
   - **All Cards** (complete deck)
   - **Hard Cards** (only cards rated `'hard'`, perfect for focused spaced repetition cramming)
   - **Unreviewed Cards** (cards not yet rated or at default status)
   - Contextual empty states for each filter with clear action prompts.

5. **Cockpit UI & Experience Enhancements:**
   - **Rating Controls**: Vivid, ergonomic buttons (Easy :green_circle:, Medium :yellow_circle:, Hard :red_circle:) with active state indicator and keyboard navigation.
   - **Mastery Progress Header**: Visual bar showing percentage mastered, card position, and count tags.
   - **Deck Completion Screen**: Summary card upon finishing a deck showing cards mastered vs needing review, with quick actions to "Study Hard Cards" or "Restart Deck".
   - Maintain cockpit dark glassmorphic styling and reuse existing Toast notifications.
