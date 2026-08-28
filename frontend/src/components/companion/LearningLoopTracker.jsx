import React from "react";
import { 
  MapPin, 
  BookOpen, 
  HelpCircle, 
  Compass, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  Layers
} from "lucide-react";
import { useLearnerProfile } from "../../contexts/LearnerProfileContext";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "./WhyRecommendationBadge";

export const LearningLoopTracker = ({
  activeTopic = "Binary Search",
  onActionClick = null,
  className = ""
}) => {
  const { profile } = useLearnerProfile();
  const loopState = profile.learningLoopState || {
    whereAmI: activeTopic,
    whatAmILearning: "Why Binary Search is $O(\\log_2 n)$ through array halving",
    whatShouldIDo: "Try a quick understanding check on array halving",
    whyAmISeeingThis: "Because you struggled with logarithm proofs twice",
    whatShouldILearnNext: "Logarithms → Binary Search → Merge Sort"
  };

  return (
    <div className={`p-3.5 bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2.5 ${className}`}>
      
      {/* Top Learning Loop Navigation Flow */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <div className="p-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span>Active Learning Path:</span>
          <span className="text-brand-600 dark:text-brand-400 font-mono text-[11px]">
            <MathRenderer text={loopState.whatShouldILearnNext} />
          </span>
        </div>

        <WhyRecommendationBadge
          type="topic"
          customReason={loopState.whyAmISeeingThis}
          buttonText="Why this topic?"
        />
      </div>

      {/* 4 Pillars UX Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        
        {/* Pillar 1: Where Am I */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-500" />
            <span>Where Am I?</span>
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
            {loopState.whereAmI}
          </p>
        </div>

        {/* Pillar 2: What Am I Learning */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-blue-500" />
            <span>What Am I Learning?</span>
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
            <MathRenderer text={loopState.whatAmILearning} />
          </p>
        </div>

        {/* Pillar 3: Why Am I Seeing This */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span>Why Am I Seeing This?</span>
          </span>
          <p className="font-bold text-amber-700 dark:text-amber-300 truncate">
            <MathRenderer text={loopState.whyAmISeeingThis} />
          </p>
        </div>

        {/* Pillar 4: What Should I Do (Action) */}
        <div className="p-2.5 bg-brand-50/80 dark:bg-brand-950/40 rounded-xl border border-brand-200/60 dark:border-brand-900/40 flex items-center justify-between gap-2">
          <div className="space-y-0.5 truncate">
            <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Next Action</span>
            </span>
            <p className="font-bold text-brand-900 dark:text-brand-200 truncate">
              {loopState.whatShouldIDo}
            </p>
          </div>
          <button
            onClick={() => onActionClick && onActionClick(profile.nextStep)}
            className="p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shrink-0 shadow-xs transition-transform hover:scale-105"
            title="Start Action"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default LearningLoopTracker;
