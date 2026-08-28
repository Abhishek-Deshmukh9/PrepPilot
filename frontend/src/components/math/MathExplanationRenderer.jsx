import React, { useState, useMemo } from "react";
import katex from "katex";
import { 
  ArrowDown, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  BookOpen, 
  Info, 
  ChevronRight,
  HelpCircle,
  Calculator
} from "lucide-react";

/**
 * Dedicated High-Typography LaTeX Mathematical Explanation Renderer for PrepPilot
 * Features:
 * 1. Universal LaTeX rendering for equations, fractions, powers, subscripts, summations,
 *    integrals, matrices, vectors, limits, logarithms, probability, and complexity notation.
 * 2. Visual Derivation Flow: Step-by-step vertical equations connected by visual transition arrows (↓).
 * 3. Distinct visual styling distinguishing mathematics from regular prose.
 * 4. Interactive Term Inspector for terms in formulas.
 */

// Helper to safely render KaTeX string
export const renderKatexHtml = (latexString, isBlock = false) => {
  try {
    return katex.renderToString(latexString.trim(), {
      displayMode: isBlock,
      throwOnError: false,
      errorColor: "#ef4444",
      output: "htmlAndMathml",
      strict: false
    });
  } catch (err) {
    console.warn("KaTeX render error for formula:", latexString, err);
    return `<span class="text-rose-500 font-mono text-xs">${latexString}</span>`;
  }
};

/**
 * DerivationFlow: Renders step-by-step derivations connected by visual downward arrows (↓)
 */
export const DerivationFlow = ({ 
  title = "Step-by-Step Mathematical Derivation",
  steps = [],
  conclusion = "",
  className = ""
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTermNote, setActiveTermNote] = useState(null);

  const handleCopyStep = (latex, index) => {
    navigator.clipboard.writeText(latex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className={`p-5 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4 ${className}`}>
      {/* Derivation Title */}
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h4>
          </div>
          <span className="text-[10px] font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
            {steps.length} Derivation Steps
          </span>
        </div>
      )}

      {/* Vertical Derivation Steps Sequence with Downward Arrows */}
      <div className="flex flex-col items-center space-y-3 py-1">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const html = renderKatexHtml(step.latex || step, true);

          return (
            <React.Fragment key={idx}>
              {/* Step Card */}
              <div className="w-full group relative bg-slate-50/70 dark:bg-slate-900/50 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 transition-all shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Step Number Tag */}
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-[10px] flex items-center justify-center border border-brand-200 dark:border-brand-800 shrink-0">
                      {idx + 1}
                    </span>
                    {step.annotation && (
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {step.annotation}
                      </span>
                    )}
                  </div>

                  {/* Copy LaTeX button */}
                  <button
                    onClick={() => handleCopyStep(step.latex || step, idx)}
                    className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy LaTeX"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Formatted LaTeX Equation Block */}
                <div 
                  className="my-2 p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/80 text-center overflow-x-auto select-text shadow-2xs font-medium text-slate-900 dark:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* Explanatory Subtext / Rationale */}
                {step.rationale && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed pl-1">
                    {step.rationale}
                  </p>
                )}
              </div>

              {/* Downward Transition Flow Arrow (↓) */}
              {!isLast && (
                <div className="flex flex-col items-center justify-center -my-1 text-brand-500 dark:text-brand-400">
                  <div className="w-0.5 h-3 bg-brand-300 dark:bg-brand-700 rounded-full" />
                  <div className="p-1 bg-brand-50 dark:bg-brand-950 rounded-full border border-brand-200 dark:border-brand-800 shadow-2xs">
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div className="w-0.5 h-3 bg-brand-300 dark:bg-brand-700 rounded-full" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Final Conclusion Box */}
      {conclusion && (
        <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start space-x-2.5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <span className="font-bold block mb-0.5">Final Mathematical Result:</span>
            <div dangerouslySetInnerHTML={{ __html: renderKatexHtml(conclusion, false) }} />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * MathExplanationRenderer: Main mathematical prose and LaTeX expression component
 */
export const MathExplanationRenderer = ({
  content = "",
  formula = null,
  isBlock = false,
  derivationSteps = null,
  title = null,
  conclusion = null,
  className = ""
}) => {
  // If dedicated derivation steps array is passed
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

  // If a single direct formula is provided
  if (formula) {
    const html = renderKatexHtml(formula, isBlock);
    return (
      <span
        className={`math-distinct-badge select-text ${
          isBlock 
            ? "block my-3 p-3 bg-white/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs text-center overflow-x-auto font-medium" 
            : "inline-block px-1.5 py-0.5 mx-0.5 bg-brand-50/80 dark:bg-brand-950/50 text-brand-900 dark:text-brand-100 border border-brand-200/60 dark:border-brand-800/60 rounded-md font-medium"
        } ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Parse prose containing $inline$ and $$display$$ LaTeX blocks
  const parsedTokens = useMemo(() => {
    if (!content || typeof content !== "string") return [];

    const tokens = [];
    // Regex matching $$...$$, \[...\], and $...$
    const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const matchStart = match.index;
      const matchStr = match[0];

      if (matchStart > lastIndex) {
        tokens.push({
          type: "prose",
          text: content.substring(lastIndex, matchStart)
        });
      }

      if (matchStr.startsWith("$$") && matchStr.endsWith("$$")) {
        tokens.push({
          type: "math-display",
          formula: matchStr.slice(2, -2).trim()
        });
      } else if (matchStr.startsWith("\\[") && matchStr.endsWith("\\]")) {
        tokens.push({
          type: "math-display",
          formula: matchStr.slice(2, -2).trim()
        });
      } else if (matchStr.startsWith("$") && matchStr.endsWith("$")) {
        tokens.push({
          type: "math-inline",
          formula: matchStr.slice(1, -1).trim()
        });
      }

      lastIndex = matchStart + matchStr.length;
    }

    if (lastIndex < content.length) {
      tokens.push({
        type: "prose",
        text: content.substring(lastIndex)
      });
    }

    return tokens;
  }, [content]);

  return (
    <div className={`leading-relaxed select-text ${className}`}>
      {parsedTokens.map((token, idx) => {
        if (token.type === "prose") {
          return <span key={idx}>{token.text}</span>;
        }

        const isDisplay = token.type === "math-display";
        const html = renderKatexHtml(token.formula, isDisplay);

        if (isDisplay) {
          return (
            <div 
              key={idx}
              className="my-3 p-3.5 bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 rounded-xl text-center overflow-x-auto shadow-2xs"
            >
              <span dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          );
        }

        return (
          <span 
            key={idx}
            className="inline-block px-1.5 py-0.5 mx-0.5 bg-brand-50/70 dark:bg-brand-950/50 border border-brand-200/50 dark:border-brand-800/50 rounded-md font-medium text-brand-900 dark:text-brand-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};

export default MathExplanationRenderer;
