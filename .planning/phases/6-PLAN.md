# Phase 6 — Plan: Add Regeneration Capability

> **Phase:** 6 — Add Regeneration Capability  
> **Milestone:** 1 — Stabilize & Fix  
> **Status:** Pending Approval  

---

## 1. Overview
Implement explicit cache-bypass (`force_refresh: bool = False`) and safe in-place cache updates across all AI study tools (Summary, Revision, MCQ, and Key Points). Add consistent, glassmorphic "Regenerate" controls with duplicate-submission protection and clear "Retake Quiz" vs. "New Questions" separation in the MCQ workflow.

---

## 2. Technical Scope

### Backend
1. **Summary Generator & Route:**
   - Add `force_refresh: bool = False` to `SummaryRequest` in `app/schemas/summary.py`.
   - Update `SummaryGenerator.get_or_generate_summary` to support `force_refresh`.
   - Safe mutation: Only update `cached_summary.generated_text` and `created_at` after Gemini succeeds.
2. **Revision Generator & Route:**
   - Add `force_refresh: bool = False` to `RevisionRequest` in `app/api/routes/revision.py`.
   - Update `RevisionGenerator.get_or_generate_revision_notes` to safely update `cached_notes` on `force_refresh=True`.
3. **MCQ Generator & Route:**
   - Add `force_refresh: bool = False` to `MCQRequest` in `app/schemas/mcq.py`.
   - Update `MCQGenerator.get_or_generate_mcqs` to bypass cache and update `cached_content` when `force_refresh=True`.
4. **Key Points Route & Persistence:**
   - Add `force_refresh: bool = False` to `KeyPointsRequest` in `app/api/routes/keypoints.py`.
   - Add `GET /api/v1/keypoints/{document_id}` endpoint.
   - Cache key points in `GeneratedContent` (`content_type="keypoints"`). Safe update on `force_refresh=True`.

### Frontend
1. **`studyService.js`:**
   - Add `forceRefresh = false` argument to `generateSummary`, `generateRevisionNotes`, `generateMCQs`, and `generateKeyPoints`.
   - Ensure `getKeyPoints` calls `GET /keypoints/{documentId}`.
2. **`SummaryPage.jsx`:**
   - Pass `forceRefresh: true` when clicking "Regenerate".
   - Disable controls while `loading` is true.
3. **`RevisionPage.jsx`:**
   - Pass `forceRefresh: true` when clicking "Regenerate".
   - Disable controls while `loading` is true.
4. **`MCQPage.jsx`:**
   - In finished state: offer **"Retake Quiz"** (restarts with current questions, no API call) and **"New Questions (Regenerate)"** (`generateMCQs(..., forceRefresh: true)`).
   - In configuration screen: support starting fresh or continuing.
5. **`KeyPointsPage.jsx`:**
   - Load cached key points on document select via `getKeyPoints`.
   - Pass `forceRefresh: true` on "Regenerate".

---

## 3. Verification Steps
1. Verify Python imports and backend endpoints compile without error.
2. Test cache bypass: First call caches, second call with `force_refresh=False` returns cached record (timestamp identical), third call with `force_refresh=True` generates fresh content and updates timestamp.
3. Test failure resilience: Verify simulated Gemini failure with `force_refresh=True` does NOT overwrite or erase existing cached content.
4. Verify `frontend/` builds clean (`npm run build`).
