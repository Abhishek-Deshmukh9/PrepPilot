import React, { useState } from "react";
import { 
  Calculator, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  ArrowDown, 
  Layers, 
  ListOrdered
} from "lucide-react";
import { MathRenderer, DerivationFlow } from "../common/MathRenderer";

export const MathematicalDerivation = ({
  title = "Mathematical Derivation: Binary Search Recurrence",
  prerequisites = [
    "Repeated Division: After $k$ iterations, search space is $\\frac{n}{2^k}$",
    "Logarithms & Exponents: $2^k = n \\iff k = \\log_2 n$",
    "Recurrence Relation: $T(n) = T(n/2) + \\mathcal{O}(1)$"
  ],
  steps = [
    {
      stepNumber: 1,
      title: "Recurrence Formulation",
      latex: "T(n) = T\\left(\\frac{n}{2}\\right) + 1",
      annotation: "Initial Divide-and-Conquer Recurrence",
      explanation: "Comparing with the midpoint element takes $\\mathcal{O}(1) = 1$ operation and recurses on half the array $\\frac{n}{2}$."
    },
    {
      stepNumber: 2,
      title: "First Unrolling Step",
      latex: "T(n) = T\\left(\\frac{n}{4}\\right) + 2",
      annotation: "Substitute $T(n/2) = T(n/4) + 1$",
      explanation: "Substituting the subproblem recurrence reveals the growing count of constant additions."
    },
    {
      stepNumber: 3,
      title: "Second Unrolling Step",
      latex: "T(n) = T\\left(\\frac{n}{8}\\right) + 3",
      annotation: "Substitute $T(n/4) = T(n/8) + 1$",
      explanation: "After 3 recursive steps, the problem size is $\\frac{n}{2^3} = \\frac{n}{8}$ with 3 constant operations."
    },
    {
      stepNumber: 4,
      title: "Generalization after $k$ Steps",
      latex: "T(n) = T\\left(\\frac{n}{2^k}\\right) + k",
      annotation: "General Form for $k$ iterations",
      explanation: "Applying the recurrence $k$ times yields the parameterized formula."
    },
    {
      stepNumber: 5,
      title: "Base Case Termination Condition",
      latex: "\\frac{n}{2^k} = 1 \\implies 2^k = n \\implies k = \\log_2 n",
      annotation: "Base Case: Array size shrinks to 1 element",
      explanation: "The search space halts when $1$ element remains ($n/2^k = 1$). Taking $\\log_2$ of both sides yields $k = \\log_2 n$."
    },
    {
      stepNumber: 6,
      title: "Substitute $k = \\log_2 n$ into Recurrence",
      latex: "T(n) = T(1) + \\log_2 n = \\mathcal{O}(1) + \\log_2 n",
      annotation: "Substitute $T(1) = \\mathcal{O}(1)$",
      explanation: "Base case work $T(1)$ is constant $\\mathcal{O}(1)$ time."
    },
    {
      stepNumber: 7,
      title: "Final Asymptotic Complexity",
      latex: "T(n) = \\mathcal{O}(\\log_2 n)",
      annotation: "Tight Asymptotic Upper Bound",
      explanation: "Therefore, the worst-case time complexity of binary search is logarithmic time $\\mathcal{O}(\\log_2 n)$."
    }
  ],
  conclusion = "Therefore, the worst-case and average-case time complexity of binary search is $\\mathcal{O}(\\log_2 n)$, which grows exponentially slower than linear search $\\mathcal{O}(n)$."
}) => {
  const [viewMode, setViewMode] = useState("flow"); // 'flow' (↓ arrows) | 'accordion'
  const [copied, setCopied] = useState(false);

  const handleCopyProof = () => {
    const proofText = steps.map(s => `Step ${s.stepNumber || ""}: ${s.title || s.annotation || ""}\n$$${s.latex || s}$$\n${s.explanation || s.rationale || ""}`).join("\n\n");
    navigator.clipboard.writeText(proofText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-text">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                Step-by-Step (↓)
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Rigorous LaTeX mathematical proof with vertical transition arrows
            </p>
          </div>
        </div>

        {/* View Switcher & Copy */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode("flow")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === "flow" ? "bg-white dark:bg-slate-900 text-violet-600 shadow-xs" : "text-slate-500"
              }`}
            >
              <ArrowDown className="w-3 h-3" />
              <span>Flow (↓)</span>
            </button>
            <button
              onClick={() => setViewMode("accordion")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === "accordion" ? "bg-white dark:bg-slate-900 text-violet-600 shadow-xs" : "text-slate-500"
              }`}
            >
              <ListOrdered className="w-3 h-3" />
              <span>Steps</span>
            </button>
          </div>

          <button
            onClick={handleCopyProof}
            className="flex items-center space-x-1 px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs font-semibold transition-colors"
            title="Copy full LaTeX proof"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Proof"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 canvas-grid">
        
        {/* Prerequisite Alert Box */}
        {prerequisites && prerequisites.length > 0 && (
          <div className="p-3.5 bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/50 rounded-xl flex items-start space-x-3 shadow-xs">
            <Lightbulb className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-brand-900 dark:text-brand-200 block">
                Foundational Mathematical Prerequisites:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-brand-800/90 dark:text-brand-300/90 text-[11px]">
                {prerequisites.map((req, idx) => (
                  <li key={idx}>
                    <MathRenderer text={req} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* View Mode: Vertical Downward Arrow Flow (↓) */}
        {viewMode === "flow" && (
          <DerivationFlow
            steps={steps}
            conclusion={conclusion}
            title={null}
          />
        )}

        {/* View Mode: Step Accordion List */}
        {viewMode === "accordion" && (
          <div className="space-y-3.5">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-white/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs p-4 space-y-2.5"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center border border-violet-200 dark:border-violet-800">
                    {step.stepNumber || idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {step.title || step.annotation}
                  </span>
                </div>

                <div className="p-3 bg-violet-50/40 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30 overflow-x-auto text-center">
                  <MathRenderer formula={step.latex || step} block={true} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                  <MathRenderer text={step.explanation || step.rationale} />
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MathematicalDerivation;
