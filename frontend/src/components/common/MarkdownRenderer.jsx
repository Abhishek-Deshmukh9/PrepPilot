import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/**
 * Fix LaTeX commands corrupted by JSON single-backslash escaping.
 *
 * JSON.parse converts un-doubled backslash sequences into control chars:
 *   \b → U+0008 (backspace) — corrupts \boldsymbol, \bar, \beta …
 *   \f → U+000C (form-feed)  — corrupts \frac, \forall …
 *   \r → U+000D (CR)         — corrupts \rightarrow, \rho …
 *   \v → U+000B (vert-tab)   — corrupts \vec, \vee …
 *   \t → U+0009 (tab)        — corrupts \text, \times, \theta …
 */

// Restore control-char → backslash for unambiguous cases
const UNCONDITIONAL_FIXES = [
  [/\x08([a-zA-Z@{\\])/g, "\\$1"],  // \b → \b…
  [/\x0C([a-zA-Z@{\\])/g, "\\$1"],  // \f → \f…
  [/\x0D([a-zA-Z@{\\])/g, "\\$1"],  // \r → \r…
  [/\x0B([a-zA-Z@{\\])/g, "\\$1"],  // \v → \v…
];

// Restore \t only when it sits between math delimiters
const fixTabInMath = (text) =>
  text.replace(/(\${1,2})([\s\S]*?)(\1)/g, (match, open, body, close) =>
    open + body.replace(/\x09([a-zA-Z@{\\])/g, "\\$1") + close
  );

/**
 * Normalizes LaTeX delimiters and disambiguates currency figures from math blocks.
 *
 * 1. Converts standard LLM bracket notation:
 *    \[ ... \] → $$ ... $$ (display math)
 *    \( ... \) → $ ... $   (inline math)
 *
 * 2. Protects standalone currency ($50, $100.00, $50/mo, $1,000) from being
 *    treated as math delimiters by escaping them as \$.
 *    Legitimate math formulas starting with numbers (e.g. $10 + x = 20$) are preserved.
 */
const normalizeMarkdownAndMath = (text) => {
  if (!text || typeof text !== "string") return text;
  let s = text;

  // Step 1: Restore JSON control characters
  for (const [pattern, replacement] of UNCONDITIONAL_FIXES) {
    s = s.replace(pattern, replacement);
  }

  // Step 2: Normalize display math \[ ... \] or \\[ ... \\] to $$ ... $$
  s = s.replace(/\\\\?\[([\s\S]*?)\\\\?\]/g, (match, inner) => {
    return `\n\n$$\n${inner.trim()}\n$$\n\n`;
  });

  // Step 3: Normalize inline math \( ... \) or \\( ... \\) to $ ... $
  s = s.replace(/\\\\?\(([\s\S]*?)\\\\?\)/g, (match, inner) => {
    return `$${inner.trim()}$`;
  });

  // Step 4: Fix tabs inside math blocks
  s = fixTabInMath(s);

  // Step 5: Protect standalone currency figures
  // Matches $ followed immediately by digits and currency suffix, but NOT followed by math operators
  s = s.replace(
    /(^|[\s(])\$(\d+(?:,\d{3})*(?:\.\d+)?(?:[a-zA-Z/]+)?)(?=$|[\s,;!?.)])(?!\s*[-+*=<>^_\\/])/g,
    (match, prefix, amount) => `${prefix}\\$${amount}`
  );

  return s;
};

// Shared rehype-katex config with graceful error handling
const KATEX_OPTIONS = {
  throwOnError: false,    // never crash — degrade to highlighted error text
  strict: false,          // accept extended/non-standard commands
  errorColor: "#ef4444",  // rose-500
  trust: false,
  output: "htmlAndMathml",
};

/**
 * MarkdownRenderer — single, reliable renderer for all AI-generated content in PrepPilot.
 *
 * Handles:
 *   • Full Markdown & GFM: headings, bold, italic, lists, code blocks, tables, blockquotes
 *   • Inline LaTeX:        $x^2 + y^2$ and \( O(\log n) \)
 *   • Block LaTeX:         $$\frac{a}{b}$$ and \[ T(n) = 2T(n/2) + O(n) \]
 *   • Currency protection: $50, $100/mo, $1,000 preserved as text
 *   • JSON-corrupted LaTeX backslash sequences auto-restored
 *
 * Props:
 *   content   {string}  — raw text (may contain Markdown + LaTeX)
 *   compact   {bool}    — suppress paragraph bottom-margin (chat bubbles, cards, table cells)
 *   className {string}  — extra Tailwind classes on wrapper div
 */
const MarkdownRenderer = ({ content = "", compact = false, className = "" }) => {
  if (!content || typeof content !== "string") return null;

  const safeContent = normalizeMarkdownAndMath(content);

  return (
    <div
      className={`markdown-body leading-relaxed select-text ${compact ? "compact" : ""} ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, KATEX_OPTIONS]]}
        components={{
          // ── Headings ────────────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 className="font-display text-xl font-black text-slate-900 dark:text-slate-50 mt-5 mb-3 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-4 mb-2.5 border-b border-slate-100 dark:border-slate-800 pb-1 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-200 mt-3.5 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mt-3 mb-1.5 first:mt-0">
              {children}
            </h4>
          ),

          // ── Paragraph ────────────────────────────────────────────────────
          p: ({ children }) => (
            <p className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed ${compact ? "" : "mb-2.5"}`}>
              {children}
            </p>
          ),

          // ── Lists ─────────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className={`list-disc list-outside ml-4 space-y-1 text-sm text-slate-700 dark:text-slate-300 ${compact ? "" : "mb-2.5"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-outside ml-4 space-y-1 text-sm text-slate-700 dark:text-slate-300 ${compact ? "" : "mb-2.5"}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // ── Inline formatting ─────────────────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-bold text-slate-800 dark:text-slate-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
          ),

          // ── Code (inline + block) ────────────────────────────────────────
          code: ({ node, className: cls, children, ...props }) => {
            const hasLang = cls && cls.startsWith("language-");

            if (!hasLang) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-300 rounded text-[0.8em] font-mono border border-slate-200 dark:border-slate-700"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={`font-mono text-xs ${cls || ""}`} {...props}>
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre className="my-3 p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-slate-700/50">
              {children}
            </pre>
          ),

          // ── Blockquote ───────────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-4 border-l-4 border-brand-400 dark:border-brand-600 text-slate-600 dark:text-slate-400 italic text-sm">
              {children}
            </blockquote>
          ),

          // ── Tables (with horizontal scroll & cockpit styling) ────────────
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-xs text-left border-collapse min-w-[320px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 bg-white/40 dark:bg-slate-950/40">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
              {children}
            </tr>
          ),

          // ── Misc ─────────────────────────────────────────────────────────
          hr: () => (
            <hr className="my-4 border-slate-200 dark:border-slate-800" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              {children}
            </a>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
export { MarkdownRenderer };
