# Phase 5 — Implementation Plan: Fix Markdown & Content Rendering

> **Phase:** 5 — Fix Markdown & Content Rendering  
> **Created:** 2026-09-20  
> **Context:** [5-CONTEXT.md](file:///c:/Users/abhis/Desktop/Pjts/PrepPilot/.planning/phases/5-CONTEXT.md)  
> **Status:** Ready for Review  

---

## Plan Overview

Implement unified, robust Markdown and KaTeX rendering across all study tools:
1. **Enhanced Pre-Processor in `MarkdownRenderer.jsx`**:
   - Auto-normalize `\[...\]` :arrow_right: `$$...$$` and `\(...\)` :arrow_right: `$...$`.
   - Protect currency figures (`$100`, `$50/mo`, `$1,000`) without escaping legitimate math (`$10 + x = 20$`).
   - Restore control-character escapes (`\b`, `\f`, `\r`, `\v`, `\t`).
2. **Table Parsing with `remark-gfm`**:
   - Integrate `remark-gfm` in `MarkdownRenderer` plugins.
   - Glassmorphic cockpit styling for tables with responsive horizontal scrolling.
3. **Standardize `KeyPointsPage.jsx`**:
   - Render concept titles and memory tips with `MarkdownRenderer` so math notation like `$O(\log n)$` renders properly.
4. **Resilience & Overflow**:
   - KaTeX display equations and tables scroll smoothly with subtle scrollbars without breaking parent card dimensions.
   - Graceful fallback for malformed LaTeX.

---

## Task Breakdown

### Task 1: Integrate `remark-gfm` and LaTeX Pre-Processing
**Files:**
- `frontend/src/components/common/MarkdownRenderer.jsx` [MODIFY]
- `frontend/src/index.css` [MODIFY]

**Changes:**
- In `MarkdownRenderer.jsx`:
  - Import `remarkGfm` from `"remark-gfm"`.
  - Pass `[remarkGfm, remarkMath]` to `remarkPlugins`.
  - Update `normalizeContent()` to handle bracket math delimiters (`\[...\]` and `\(...\)`).
  - Add regex to escape standalone currency amounts while preserving legitimate math.
  - Wrap table in an `overflow-x-auto` container with glassmorphic styling.
- In `index.css`:
  - Ensure `.katex-display` has `overflow-x: auto` and custom slim scrollbar styles.

---

### Task 2: Standardize `KeyPointsPage.jsx`
**File:**
- `frontend/src/pages/KeyPointsPage.jsx` [MODIFY]

**Changes:**
- Replace raw `{point.concept || point.title}` in `<h3>` with `<MarkdownRenderer content={point.concept || point.title} compact />`.
- Replace raw `{point.memory_tip}` with `<MarkdownRenderer content={point.memory_tip} compact />`.
- Ensure category tags and formula blocks render cleanly with consistent font sizes.

---

### Task 3: Audit & Verify Study Pages (`SummaryPage`, `RevisionPage`, `MCQPage`)
**Files:**
- `frontend/src/pages/SummaryPage.jsx` [VERIFY]
- `frontend/src/pages/RevisionPage.jsx` [VERIFY]

**Changes:**
- Verify that summaries and revision notes with GFM tables, dense formulas, code snippets, and blockquotes render seamlessly.
- Verify that copy-to-clipboard or export functionality correctly preserves content.

---

### Task 4: Comprehensive Automated & Production Verification
- Run verification script checking:
  - Inline math: `$x^2 + y^2 = z^2$` and `\( O(\log n) \)`
  - Block math: `$$ \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} $$` and `\[ T(n) = 2T(n/2) + O(n) \]`
  - Currency values: `$50`, `$100.00/mo`, `$1,000`
  - Math starting with numbers: `$10 + x = 20$`
  - Markdown tables with headers and pipes
  - Code blocks and blockquotes
- Run `npm run build` in `frontend/`.
