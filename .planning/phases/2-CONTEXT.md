# Phase 2 — Discussion Context: Fix Upload Polling & Document State

> **Phase:** 2 — Fix Upload Polling & Document State  
> **Created:** 2026-09-20  
> **Status:** Discussion

---

## Current Architecture

### Backend (Working Correctly)
- `POST /upload/` — saves file, creates DB record with `status="processing"`, schedules `process_document_task` as FastAPI background task
- Background task: extract → chunk → embed → store in ChromaDB → update DB to `status="ready"` (or `"error"`)
- `GET /documents/` — returns all documents with current status
- `GET /documents/{id}` — returns single document with status

### Frontend
- **DocumentContext.jsx** — already has polling logic (lines 44-67):
  - Checks if any document has `status === "processing"`
  - If yes, starts a 3s interval calling `fetchDocuments()`
  - Stops polling when no documents are processing
- **UploadPage.jsx** — calls `documentService.upload()` with progress callback, then `fetchDocuments()` on success
- **documentService.js** — has `upload()`, `list()`, `get()`, `delete()`

## Identified Issues

### Issue 1: Polling logic may not trigger
The polling effect depends on `documents` state. After upload, `fetchDocuments()` is called which updates `documents`. The new document should have `status: "processing"`, which triggers the polling effect.

### Issue 2: No visual feedback during processing
- Upload progress bar shows HTTP upload progress (bytes sent to server)
- Once upload completes (100%), there's no indication that backend is still processing

### Issue 3: No status indicator in document list
- Documents in the list don't show their processing status
- No distinction between "processing", "ready", and "error" states

### Issue 4: activeDocument may be stale
- If user selects a document while it's still processing, activeDocument points to the processing version
- Chat/study tools may fail because the document has no chunks yet

## Proposed Scope

1. Verify polling works — Test the actual upload flow end-to-end and fix if broken
2. Add processing status indicator — Show processing/ready/error badges on each document card
3. Add post-upload processing feedback — After HTTP upload completes, show "Processing document..." state
4. Guard against selecting processing documents — Prevent or warn when selecting a document that isn't ready
5. Handle error state — Show error message if document processing fails
