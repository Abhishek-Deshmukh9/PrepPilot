# Phase 3 — Context: Fix Settings & API Configuration

> **Phase:** 3 — Fix Settings & API Configuration  
> **Created:** 2026-09-20  
> **Status:** Discussion & Decisions Complete  

---

## Decisions Made

1. **Live Health & System Info Endpoints:**
   - Expose `/api/v1/health` and `/api/v1/system/info` on the backend.
   - Allows frontend to ping connection and fetch live server metadata directly through the configured API gateway without URL hacking.

2. **Live Backend Configuration Parameters:**
   - Replace static/hardcoded parameters in `SettingsPage.jsx` with live values fetched from `/api/v1/system/info`.
   - Displays real backend values: `gemini_model`, `embedding_model`, `chunk_size`, `chunk_overlap`, `top_k`, `max_file_size_mb`, `app_version`.

3. **URL Normalization & "Reset to Default":**
   - Normalizer ensures URL has protocol (`http://` or `https://`), trims whitespace, strips trailing slashes, and appends `/api/v1` if missing without duplicating `/api/v1/api/v1`.
   - Provide a "Reset to Default" button to restore the base URL to `VITE_API_URL` or `http://localhost:8000/api/v1`.

4. **Granular Resets with Existing Toast System:**
   - Instead of a single destructive `localStorage.clear()`:
     - Reset API URL (reverts gateway to default, displays toast)
     - Clear Document & Cache State (clears active document and temporary caches, preserves learner persona)
     - Reset All App Data (explicit confirmation prompt, full wipe, reloads app)
   - Reuse `addToast` from `useDocuments()` / `Toast.jsx`.

5. **Learner Persona & Tutor Style:**
   - Wire `LearnerProfileContext` into SettingsPage.
   - Allow user to view and switch between Student A, B, C, D archetypes directly in Settings.
   - Single source of truth (no redundant preference systems).

6. **Focused Scope:**
   - Reuse existing design tokens, components, and contexts. No unrelated refactoring.
