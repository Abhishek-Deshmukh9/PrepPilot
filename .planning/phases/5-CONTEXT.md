# Phase 5 — Context: Fix Markdown & Content Rendering

> **Phase:** 5 — Fix Markdown & Content Rendering  
> **Created:** 2026-09-20  
> **Status:** Decisions Finalized  

---

## Decisions & Requirements

1. **LaTeX Delimiter Normalization:**
   - Pre-process content in `MarkdownRenderer.jsx` to normalize `\[...\]` :arrow_right: `$$...$$` and `\(...\)` :arrow_right: `$...$`.
   - Ensures KaTeX renders standard LaTeX produced by LLMs regardless of whether brackets or dollar signs were generated.

2. **Currency Disambiguation:**
   - Protect standalone currency figures (e.g. `$50`, `$1,000`, `$50/mo`) by escaping to `\$` so `remark-math` does not pair two unrelated dollar signs across paragraphs into a broken math block.
   - Accurately preserve legitimate math formulas starting with numbers (e.g. `$10 + x = 20$`) and single variables (`$x$`).

3. **Markdown Tables with `remark-gfm`:**
   - Add `remark-gfm` to `MarkdownRenderer` remark plugins.
   - Render markdown tables in summaries, cheat sheets, and notes with cockpit/glassmorphic styling, rounded borders, and horizontal scrolling.

4. **Standardize All Study Pages:**
   - Standardize `KeyPointsPage.jsx` to use `MarkdownRenderer` for card headers (`point.concept`) and memory tips, ensuring LaTeX like `$O(\log n)$` renders with KaTeX instead of raw dollar signs.
   - Ensure `SummaryPage.jsx` and `RevisionPage.jsx` rely on the unified `MarkdownRenderer` pipeline without ad-hoc string splitters.

5. **Wide Math & Table Layout Resilience:**
   - Enable horizontal scrolling for wide equations (`.katex-display`) and tables so layout boundaries never break or clip.
   - Safe KaTeX error tolerance (`throwOnError: false`) so malformed equations degrade gracefully without breaking page render.
