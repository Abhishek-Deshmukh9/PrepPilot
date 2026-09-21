# Phase 6 — Context: Add Regeneration Capability

> **Phase:** 6 — Add Regeneration Capability  
> **Created:** 2026-09-21  
> **Status:** Decisions Finalized  

---

## Decisions & Requirements

1. **Backend Cache Bypass (`force_refresh: bool = False`):**
   - Add `force_refresh: bool = False` to `SummaryRequest`, `RevisionRequest`, `MCQRequest`, and `KeyPointsRequest`.
   - Default is always `False` to maintain fast, low-cost cached responses on normal requests.
   - When `force_refresh=True`: bypass cached lookup, call Gemini for fresh content, validate the result, and update the existing `GeneratedContent` record in-place.

2. **Safe Mutation Pattern (Content Preservation on Failure):**
   - If `force_refresh` generation fails (e.g. Gemini rate limit, API error, or validation failure), do NOT alter or delete the existing database record.
   - Only update `GeneratedContent` (`generated_text`, `model_used`, `created_at = datetime.utcnow()`) after fresh content is successfully generated and verified.

3. **MCQ Clear Separation (Retake vs. New Questions):**
   - **Retake Quiz:** Reuses the current question set in-memory/cache. Resets score, index, and answer states with no API call or a cached fetch.
   - **New Questions (Regenerate):** Calls `studyService.generateMCQs(activeDocument.id, count, difficulty, true)` to generate a genuinely new question set.
   - Both options must be clearly accessible on the Quiz Finished view and during configuration.

4. **Key Points Persistence Parity:**
   - Store extracted key points in `GeneratedContent` (`content_type="keypoints"`) serialized as JSON.
   - Implement `GET /api/v1/keypoints/{document_id}` to retrieve saved key points.
   - In `KeyPointsPage.jsx`, automatically load cached key points when switching to a document so users do not lose their extracted concepts.
   - Clicking "Regenerate" sends `force_refresh=True`.

5. **Consistent Cockpit/Glassmorphic UI Controls:**
   - Add clean, consistent "Regenerate" buttons with icon (`RotateCcw`), spinner (`Loader2`), and clear tooltips/labels.
   - Disable all regeneration controls while any generation is in flight to prevent duplicate submissions.
   - Preserve existing cockpit dark / glassmorphic styling without full page redesigns.
