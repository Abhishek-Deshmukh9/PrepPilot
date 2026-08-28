import React, { useState } from "react";
import { 
  User, 
  Target, 
  Sparkles, 
  Layers, 
  Lightbulb, 
  Calculator, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  History, 
  BrainCircuit, 
  CheckCircle2,
  Clock,
  Zap,
  Sliders
} from "lucide-react";
import { useLearnerProfile } from "../../contexts/LearnerProfileContext";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "./WhyRecommendationBadge";

export const LearnerProfileHUD = ({
  onArchetypeChange = null
}) => {
  const { profile, activeArchetypeId, switchArchetype, archetypes } = useLearnerProfile();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelectArchetype = (archId) => {
    switchArchetype(archId);
    if (onArchetypeChange) {
      onArchetypeChange(archetypes[archId]);
    }
  };

  const styleLabels = {
    visual: { label: "Visual & Animated", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
    fundamentals_first: { label: "Fundamentals First", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    worked_examples: { label: "Worked Step-by-Step", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    prerequisite_remediation: { label: "Recursion Remediation", color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800" }
  };

  const currentStyleBadge = styleLabels[profile.preferredExplanationStyle] || styleLabels.visual;

  return (
    <div className="bg-white/85 dark:bg-slate-950/85 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl transition-all overflow-hidden">
      {/* Compact Top Bar */}
      <div className="p-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Archetype Quick Switcher Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <User className="w-3 h-3 text-brand-500" />
            <span>Learner:</span>
          </span>
          {Object.values(archetypes).map((arch) => {
            const isSelected = activeArchetypeId === arch.id;
            return (
              <button
                key={arch.id}
                onClick={() => handleSelectArchetype(arch.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-xs scale-[1.02]"
                    : "bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {arch.name.split("(")[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Live Metrics & Inspector Toggle */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Mastery Metric */}
          <div className="flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-slate-400 text-[10px] font-medium hidden sm:inline">Mastery:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-[11px]">
              {profile.masteryLevel}%
            </span>
            <div className="w-14 sm:w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${profile.masteryLevel}%` }} 
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* Style Badge */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentStyleBadge.color}`}>
            {currentStyleBadge.label}
          </span>

          {/* Toggle Full Profile Inspector */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors flex items-center gap-0.5"
            title="Inspect 11-Dimensional Learner Profile"
          >
            <span className="text-[10px] font-semibold hidden md:inline">{isExpanded ? "Hide Profile" : "Profile Details"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Profile Inspector Drawer */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs animate-slide-up">
          
          {/* Card 1: Weak Concepts & Prerequisite Gaps */}
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Weak Concepts</span>
              </span>
              <WhyRecommendationBadge
                type="prerequisite"
                customReason="Recommended because you struggled with this concept twice in recent sessions."
                variant="icon"
              />
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
              {profile.weakConcepts.map((w, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-rose-500 font-bold">•</span>
                  <MathRenderer text={w} />
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Frequently Made Mistakes */}
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <span>Frequent Mistakes</span>
              </span>
              <WhyRecommendationBadge
                type="practice_question"
                customReason="Recommended because these calculation and boundary mistakes were logged 3 times."
                variant="icon"
              />
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
              {profile.frequentlyMadeMistakes.map((m, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <MathRenderer text={m} />
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Recent Quiz Performance */}
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Quiz Accuracy ({profile.recentQuizPerformance.averageScore}%)</span>
              </span>
              <WhyRecommendationBadge
                type="quiz"
                customReason="Recommended because your accuracy has dropped in this topic."
                variant="icon"
              />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
              <p>Quizzes Taken: <strong>{profile.recentQuizPerformance.quizzesTaken}</strong></p>
              <p>Last Score: <strong>{profile.recentQuizPerformance.lastScore}%</strong></p>
              <p className="text-[10px] text-slate-500 truncate">Last Error: {profile.recentQuizPerformance.recentErrors[0]}</p>
            </div>
          </div>

          {/* Card 4: Spaced Revision History */}
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Spaced Revision</span>
              </span>
              <WhyRecommendationBadge
                type="revision"
                customReason="Recommended because your retention curve is due for review today."
                variant="icon"
              />
            </div>
            <div className="space-y-1 text-[11px]">
              {profile.revisionHistory.map((rev, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300 text-[10px]">
                  <span>{rev.topic}</span>
                  <span className="text-slate-400 font-mono">{rev.reviewedAt}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default LearnerProfileHUD;
