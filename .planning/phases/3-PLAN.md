# Phase 3 — Implementation Plan: Fix Settings & API Configuration

> **Phase:** 3 — Fix Settings & API Configuration  
> **Created:** 2026-09-20  
> **Context:** [3-CONTEXT.md](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/.planning/phases/3-CONTEXT.md)  
> **Status:** Ready for Execution  

---

## Plan Overview

Implement an end-to-end, resilient settings and API configuration system across backend and frontend:
1. **Backend System Endpoints:** Add `/api/v1/health` and `/api/v1/system/info` returning dynamic runtime configuration.
2. **Frontend URL Normalization & System Service:** Add `normalizeApiUrl()` in `api.js` (guards against duplicate `/api/v1` and malformed URLs) and create `systemService.js` to ping health and fetch server metadata.
3. **Connection Gateway & Testing:** Live "Test Connection" with latency in ms, status indicators, and "Reset to Default".
4. **Live Architecture Parameters:** Replace hardcoded cards with live backend data (LLM engine, embeddings, chunk config, file size limit).
5. **Learner Persona Selector:** Embed archetype switching (`student_a` through `student_d`) using `LearnerProfileContext`.
6. **Granular Danger Zone:** Provide 3 distinct reset tiers with safety confirmations and toast feedback using `useDocuments().addToast`.

---

## Task Breakdown

### Task 1: Backend Health & System Info Endpoints
**Files:**
- `backend/app/api/routes/system.py` [NEW]
- `backend/app/api/routes/__init__.py` [MODIFY]

**Changes:**
- Create `system.py` with:
  - `GET /health` -> `{"status": "healthy", "app": settings.app_name, "version": settings.app_version}`
  - `GET /system/info` ->
    ```python
    {
      "app_name": settings.app_name,
      "app_version": settings.app_version,
      "environment": settings.app_env,
      "llm_engine": settings.gemini_model,
      "embedding_model": settings.embedding_model,
      "chunk_size": settings.chunk_size,
      "chunk_overlap": settings.chunk_overlap,
      "top_k": settings.top_k,
      "max_file_size_mb": settings.max_file_size_mb,
      "status": "online"
    }
    ```
- In `backend/app/api/routes/__init__.py`, include `system_router` into `api_router` under prefix `""` (or `"/system"`).

---

### Task 2: Frontend URL Normalization & System Service
**Files:**
- `frontend/src/services/api.js` [MODIFY]
- `frontend/src/services/systemService.js` [NEW]

**Changes:**
- In `api.js`:
  - Implement `normalizeApiUrl(url)`:
    - Trims whitespace.
    - Ensures scheme (`http://` or `https://`).
    - Strips trailing `/` slashes.
    - Appends `/api/v1` if missing; avoids duplicate `/api/v1/api/v1`.
  - Export `normalizeApiUrl` and `DEFAULT_API_BASE_URL`.
  - Ensure request interceptor uses `normalizeApiUrl` when reading from `localStorage.getItem("preppilot_api_url")`.
- In `systemService.js`:
  - `checkHealth(targetUrl)`: Sends a lightweight GET to `/health` with timeout, returns `{ ok: boolean, latencyMs: number, data?: any, error?: string }`.
  - `getSystemInfo()`: Calls `apiClient.get("/system/info")` and returns the response data.

---

### Task 3: Connection Gateway & Health Test in SettingsPage
**File:**
- `frontend/src/pages/SettingsPage.jsx` [MODIFY]

**Changes:**
- Connect `apiUrl` state with `normalizeApiUrl`.
- Add **"Test Connection"** button:
  - Dispatches `systemService.checkHealth(apiUrl)`.
  - Shows loading spinner while testing.
  - Displays green badge with latency ("Online • 42ms") or red badge ("Failed to connect").
- Add **"Reset to Default"** button that restores `apiUrl` to `DEFAULT_API_BASE_URL`.
- Use `addToast` from `useDocuments()` for "Settings saved!" toast notification.

---

### Task 4: Dynamic Architecture Parameters in SettingsPage
**File:**
- `frontend/src/pages/SettingsPage.jsx` [MODIFY]

**Changes:**
- Fetch system info on mount via `systemService.getSystemInfo()`.
- Display live values in the 4 grid cards (or 6 cards including Max File Size and App Version).
- Add a refresh button and loading state.
- Graceful fallback if backend is unreachable (show "Unavailable (offline)").

---

### Task 5: Learner Persona & Tutor Style Selection
**File:**
- `frontend/src/pages/SettingsPage.jsx` [MODIFY]

**Changes:**
- Import `useLearnerProfile` from `../contexts/LearnerProfileContext`.
- Display card-based radio selection for the 4 archetypes:
  - Visual Learner (`student_a`)
  - Beginner Foundations (`student_b`)
  - Conceptual / Worked Examples (`student_c`)
  - Fast Learner (`student_d`)
- Display badge, explanation style, and rationale for active profile.
- Switching persona calls `switchArchetype(id)` and triggers a toast: "Learner persona updated to [Name]".

---

### Task 6: Granular Danger Zone Actions
**File:**
- `frontend/src/pages/SettingsPage.jsx` [MODIFY]

**Changes:**
- Replace the single `localStorage.clear()` button with 3 distinct actions:
  1. **Reset Gateway URL**: Clears custom URL, sets `apiUrl` back to default, calls `addToast("Gateway URL reset to default", "info")`.
  2. **Clear Document & Cache State**: Clears `active_document` and document selection cache, calls `addToast("Document session state cleared", "info")`.
  3. **Reset All App Data**: Shows explicit confirm prompt ("This will erase all custom settings, persona selections, and cached data. Continue?"). On confirm, calls `localStorage.clear()`, triggers toast, and reloads page after a brief delay.

---

### Task 7: Build & End-to-End Verification
- Run Python import verification for backend routes.
- Run `npx vite build` to ensure zero compilation or bundling errors in frontend.
- Test endpoint responses (`/api/v1/health` and `/api/v1/system/info`).
