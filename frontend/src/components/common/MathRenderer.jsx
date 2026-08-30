import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MathExplanationRenderer, { DerivationFlow } from "../math/MathExplanationRenderer";

/**
 * MathRenderer — Universal renderer for PrepPilot.
 *
 * Accepts either:
 *   - text   {string}  — prose/AI output containing $inline$ or $$block$$ LaTeX + Markdown
 *   - formula {string} — a bare LaTeX formula (no delimiters); rendered as inline or block KaTeX
 *   - derivationSteps  — stepped derivation flow (passed to DerivationFlow)
 *
 * For ordinary AI-generated text (the most common case) pass `text`.
 * MarkdownRenderer handles both Markdown and LaTeX in a single, reliable pass.
 */
export const MathRenderer = ({
  formula,
  text,
  block = false,
  derivationSteps = null,
  title = null,
  conclusion = null,
  compact = false,
  className = ""
}) => {
  // Stepped derivation flow — kept as-is
  if (derivationSteps && Array.isArray(derivationSteps) && derivationSteps.length > 0) {
    return (
      <DerivationFlow
        title={title}
        steps={derivationSteps}
        conclusion={conclusion}
        className={className}
      />
    );
  }

  // Bare formula (no Markdown wrapper needed) — delegate to MathExplanationRenderer
  if (formula) {
    return (
      <MathExplanationRenderer
        formula={formula}
        isBlock={block}
        className={className}
      />
    );
  }

  // General AI text — use the full Markdown + KaTeX renderer
  return (
    <MarkdownRenderer
      content={text}
      compact={compact}
      className={className}
    />
  );
};

export { DerivationFlow };
export default MathRenderer;
