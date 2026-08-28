import React, { useState } from "react";
import { 
  Target, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Zap,
  HelpCircle,
  BrainCircuit,
  Compass,
  FileCheck
} from "lucide-react";
import { useLearnerProfile } from "../../contexts/LearnerProfileContext";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "./WhyRecommendationBadge";

export const CompactInsightsPanel = ({
  onTakeNextStep = null,
  className = ""
}) => {
  const { profile } = useLearnerProfile();
  const [activeTab, setActiveTab] = useState("insights"); // 'insights' | 'prereqs' | 'progress'

  return (
    <div className={`flex flex-col h-full bg-white/80 dark:bg-slate-900/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden backdrop-blur-xl ${className}`}>
      
      {/* Top Tabs Selector: [Insights] [Prerequisites] [Progress] */}
      <div className="p-2.5 bg-white/95 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-1">
        <div className="grid grid-cols-3 gap-1 w-full p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("insights")}
            className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === "insights"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs scale-[1.02]"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-3 h-3" />
            <span>Insights</span>
          </button>

          <button
            onClick={() => setActiveTab("prereqs")}
            className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === "prereqs"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs scale-[1.02]"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Prerequisites</span>
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === "progress"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs scale-[1.02]"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Progress</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
        
        {/* ================= TAB 1: INSIGHTS ================= */}
        {activeTab === "insights" && (
          <div className="space-y-3 animate-fade-in">
            
            {/* Card 1: Current Mastery */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand-500" />
                  <span>Current Mastery</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {profile.confidenceLevel} Confidence
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                  {profile.masteryLevel}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Target: 90%+ for Exam Readiness</span>
              </div>

              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${profile.masteryLevel}%` }} 
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Card 2: Current Objective */}
            <div className="p-3 bg-brand-50/40 dark:bg-brand-950/20 rounded-2xl border border-brand-200/50 dark:border-brand-900/30 space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Current Objective</span>
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                <MathRenderer text={profile.currentObjective || "Master binary search $O(\\log n)$ array halving"} />
              </p>
            </div>

            {/* Card 3: Recent Mistake Pattern */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Recent Mistake Pattern</span>
                </span>
                <WhyRecommendationBadge
                  type="practice_question"
                  customReason="Logged from your last quiz: 2 boundary misses."
                  variant="icon"
                />
              </div>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {profile.frequentlyMadeMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <MathRenderer text={mistake} />
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* ================= TAB 2: PREREQUISITES ================= */}
        {activeTab === "prereqs" && (
          <div className="space-y-3 animate-fade-in">
            
            {/* Weak / Missing Prerequisites */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Weak / Missing Prerequisites</span>
                </span>
                <WhyRecommendationBadge
                  type="prerequisite"
                  customReason="These foundational gaps prevent mastering recurrence relations."
                  variant="icon"
                />
              </div>

              {profile.prerequisiteGaps.length === 0 ? (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No prerequisite gaps detected! You are ready for advanced topics.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {profile.prerequisiteGaps.map((gap, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <MathRenderer text={gap} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mastered Prerequisites */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Mastered Prerequisites</span>
              </span>
              <div className="space-y-1.5">
                {(profile.masteredPrerequisites || ["Array memory indexing", "Linear search $O(n)$"]).map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <MathRenderer text={item} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: PROGRESS ================= */}
        {activeTab === "progress" && (
          <div className="space-y-3 animate-fade-in">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</span>
                <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {profile.recentQuizPerformance.averageScore}%
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Quizzes Done</span>
                <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
                  {profile.recentQuizPerformance.quizzesTaken}
                </p>
              </div>
            </div>

            {/* Last Quiz Error Callout */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recent Quiz Mistake</span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                {profile.recentQuizPerformance.recentErrors[0] || "No recent mistakes logged"}
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Persistent Bottom "NEXT STEP" Proactive Recommendation Box */}
      <div className="p-3.5 bg-brand-50/80 dark:bg-brand-950/40 border-t border-brand-200/60 dark:border-brand-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Recommended Next Step</span>
          </span>
          <WhyRecommendationBadge
            type="topic"
            customReason={profile.nextStep?.reason || "Based on your current mastery level and error pattern."}
            buttonText="Why?"
          />
        </div>

        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
          <MathRenderer text={profile.nextStep?.action || "Test your understanding with a quick 1-question check"} />
        </p>

        <button
          onClick={() => onTakeNextStep && onTakeNextStep(profile.nextStep)}
          className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02]"
        >
          <span>{profile.nextStep?.buttonText || "Take 1-Question Check →"}</span>
        </button>
      </div>

    </div>
  );
};

export default CompactInsightsPanel;
