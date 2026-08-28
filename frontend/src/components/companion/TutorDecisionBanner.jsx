import React from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  Calculator, 
  Layers, 
  Target,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "./WhyRecommendationBadge";

export const TutorDecisionBanner = ({
  rationale = null,
  style = "visual",
  archetypeName = "Student Profile",
  weakConcepts = [],
  prerequisiteGaps = [],
  onFixPrerequisite = null
}) => {
  if (!rationale) return null;

  const styleIcons = {
    visual: { icon: Layers, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", label: "Visual-First Learning Strategy" },
    fundamentals_first: { icon: Lightbulb, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", label: "Foundations & Prerequisite Intercept" },
    worked_examples: { icon: Calculator, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", label: "Step-by-Step Calculation Walkthrough" },
    prerequisite_remediation: { icon: AlertTriangle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", label: "Targeted Concept Remediation" }
  };

  const currentConfig = styleIcons[style] || styleIcons.visual;
  const Icon = currentConfig.icon;

  return (
    <div className={`p-3.5 rounded-2xl border ${currentConfig.bg} ${currentConfig.border} shadow-xs space-y-2 mb-3 select-text transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-2xs ${currentConfig.color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className={`text-[11px] font-bold ${currentConfig.color}`}>
            {currentConfig.label}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <WhyRecommendationBadge
            type={style === "visual" ? "visual_explanation" : style === "fundamentals_first" ? "prerequisite" : style === "worked_examples" ? "practice_question" : "prerequisite"}
            customReason={rationale}
            buttonText="Why this strategy?"
            variant="banner_button"
          />
          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800">
            <UserCheck className="w-3 h-3 text-brand-500" />
            <span>{archetypeName}</span>
          </span>
        </div>
      </div>

      {/* Explicit Pedagogical Rationale Message */}
      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium pl-1">
        <MathRenderer text={rationale} />
      </p>

      {/* Weak Concept / Prerequisite Gap Detour Badges */}
      {(weakConcepts.length > 0 || prerequisiteGaps.length > 0) && (
        <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Targeted Gaps:</span>
          {prerequisiteGaps.map((gap, i) => (
            <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 font-medium">
              <MathRenderer text={gap} />
            </span>
          ))}
          {weakConcepts.map((weak, i) => (
            <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-medium">
              <MathRenderer text={weak} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorDecisionBanner;
