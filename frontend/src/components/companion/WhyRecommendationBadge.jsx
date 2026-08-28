import React, { useState, useRef, useEffect } from "react";
import { 
  HelpCircle, 
  Sparkles, 
  History, 
  TrendingDown, 
  Layers, 
  Lightbulb, 
  X, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Target
} from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";

/**
 * WhyRecommendationBadge: Adds an explainable "Why?" interactive popover to any recommendation.
 * Supported types:
 * - 'topic'
 * - 'revision'
 * - 'quiz'
 * - 'prerequisite'
 * - 'visual_explanation'
 * - 'practice_question'
 */

export const WhyRecommendationBadge = ({
  type = "topic",
  title = "Recommendation",
  customReason = null,
  historyEvidence = null,
  impact = null,
  className = "",
  buttonText = "Why?",
  variant = "chip" // 'chip' | 'icon' | 'banner_button'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Default rationales by recommendation category
  const defaultRationales = {
    prerequisite: {
      category: "Prerequisite Dependency",
      icon: Lightbulb,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      reason: "Recommended because this is a core prerequisite for the topic you're currently studying.",
      evidence: "Identified gap in foundational mechanics ($2^k = n \\iff k = \\log_2 n$).",
      impact: "Mastering this unlocks divide-and-conquer recurrences and algorithm analysis."
    },
    visual_explanation: {
      category: "Learning Style Adaptation",
      icon: Layers,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800",
      reason: "Recommended because you learn this type of concept better through visual examples and animations.",
      evidence: "Your learner profile shows high retention when interacting with animated step-by-step models.",
      impact: "Builds intuitive spatial mental models before mathematical derivation."
    },
    revision: {
      category: "Spaced Repetition Schedule",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800",
      reason: "Recommended because your retention curve is due for review (optimal memory consolidation window).",
      evidence: "Last reviewed 3 days ago. Memory decay probability: 45%.",
      impact: "Strengthens long-term retrieval strength ahead of exams."
    },
    quiz: {
      category: "Performance Verification",
      icon: TrendingDown,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      reason: "Recommended because your accuracy has dropped in this subtopic in recent practice.",
      evidence: "Recent quiz score dropped to 54% with 2 repeated boundary mistakes.",
      impact: "Pinpoints exact misunderstanding before bad habits solidify."
    },
    practice_question: {
      category: "Targeted Concept Practice",
      icon: Target,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      reason: "Recommended because you struggled with this specific concept twice in earlier sessions.",
      evidence: "2 previous incorrect attempts on boundary checks & sign conventions.",
      impact: "Solidifies error correction through immediate guided repetition."
    },
    topic: {
      category: "Next Learning Milestone",
      icon: Sparkles,
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-950/40",
      border: "border-brand-200 dark:border-brand-800",
      reason: "Recommended because you have mastered the prerequisites for this next logical step.",
      evidence: "Prerequisite mastery is currently 85%+, qualifying you for advance progression.",
      impact: "Keeps your learning path in the optimal zone of proximal development."
    }
  };

  const config = defaultRationales[type] || defaultRationales.topic;
  const Icon = config.icon;
  const reasonText = customReason || config.reason;
  const evidenceText = historyEvidence || config.evidence;
  const impactText = impact || config.impact;

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      {variant === "icon" ? (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/50 rounded-md transition-colors inline-flex items-center"
          title="Why is this recommended?"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      ) : variant === "banner_button" ? (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="px-2 py-0.5 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center space-x-1 shadow-2xs"
        >
          <HelpCircle className="w-3 h-3 text-brand-500" />
          <span>{buttonText}</span>
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="px-1.5 py-0.5 bg-slate-100 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-brand-950 text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300 rounded-md text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1"
        >
          <HelpCircle className="w-3 h-3" />
          <span>{buttonText}</span>
        </button>
      )}

      {/* "Why This?" Explanation Popover */}
      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-2xl text-left select-text animate-scale-in">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <div className={`p-1 rounded-md ${config.bg} ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block">
                  Why this is recommended
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                  {config.category}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Reason (Based on student learning history) */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/80 mb-2">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              <MathRenderer text={reasonText} />
            </p>
          </div>

          {/* Telemetry Evidence from History */}
          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-start space-x-1.5 text-slate-500 dark:text-slate-400">
              <History className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-700 dark:text-slate-300">Learning History:</strong>{" "}
                <MathRenderer text={evidenceText} />
              </div>
            </div>

            {impactText && (
              <div className="flex items-start space-x-1.5 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">Goal Impact:</strong>{" "}
                  <MathRenderer text={impactText} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Transparency Tag */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
            <span>PrepPilot Explainable AI Engine</span>
            <span className="text-brand-500 font-medium">Transparent Tutor</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhyRecommendationBadge;
