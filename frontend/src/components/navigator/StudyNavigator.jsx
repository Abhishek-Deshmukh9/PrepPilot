import React, { useState } from "react";
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Target, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Lightbulb, 
  Play, 
  CheckSquare, 
  Square, 
  Flame, 
  Zap,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { useLearnerProfile } from "../../contexts/LearnerProfileContext";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "../companion/WhyRecommendationBadge";

export const StudyNavigator = ({
  onLaunchTask = null,
  onAskTutor = null
}) => {
  const { profile } = useLearnerProfile();

  // Dynamic Daily Study Path State
  const [dailyTasks, setDailyTasks] = useState([
    {
      id: "task_1",
      title: "Revise Binary Search Invariants",
      time: "10 min",
      category: "revision",
      type: "step_by_step_visualization",
      completed: true,
      whyReason: "Recommended because your spaced repetition window is due today."
    },
    {
      id: "task_2",
      title: "Practice 3 Boundary & Pointer Questions",
      time: "15 min",
      category: "practice",
      type: "practice_question",
      completed: false,
      whyReason: "Recommended because you struggled with monotonic edge cases twice."
    },
    {
      id: "task_3",
      title: "Fix Off-by-One Array Index Errors",
      time: "10 min",
      category: "remediation",
      type: "code_visualization",
      completed: false,
      whyReason: "Recommended because off-by-one errors account for 65% of your lost quiz points."
    },
    {
      id: "task_4",
      title: "Attempt 5-Minute Mini Assessment",
      time: "10 min",
      category: "assessment",
      type: "quiz",
      completed: false,
      whyReason: "Recommended to verify whether you are ready to advance to BST Trees."
    }
  ]);

  const [activeQuestion, setActiveQuestion] = useState("what_to_study");

  const toggleTask = (taskId) => {
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / dailyTasks.length) * 100);

  // Proactive Mentor Answers to the 6 Core Questions
  const mentorInsights = {
    what_to_study: {
      question: "What should I study now?",
      icon: Target,
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50/50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800",
      title: "Targeted Recommendation: Binary Search Monotonic Bounds",
      description: "Based on your recent practice, focus 25 minutes on array boundary conditions before advancing to Binary Search Trees.",
      actionText: "Start Binary Search Boundary Practice",
      actionPayload: { title: "Binary Search", visual_type: "step_by_step_visualization" }
    },
    what_to_revise: {
      question: "What should I revise?",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      title: "Spaced Repetition Due: Linear vs Binary Search ($O(n) \\to O(\\log n)$)",
      description: "Your memory decay curve for Divide-and-Conquer Recurrences is due for review today (last reviewed 3 days ago).",
      actionText: "Launch Quick 5-min Spaced Revision",
      actionPayload: { title: "Mathematical Derivation", visual_type: "mathematical_derivation" }
    },
    what_weak_at: {
      question: "What am I weak at?",
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800",
      title: "Identified Weakness: Base Cases & Pointer Off-by-One Slips",
      description: "You have lost 3 marks on mid-point calculation ($mid = left + \\lfloor (right - left) / 2 \\rfloor$) and loop termination ($left \\le right$).",
      actionText: "Launch Mistake Remediation",
      actionPayload: { title: "Code Debugger", visual_type: "code_visualization" }
    },
    prerequisite_missing: {
      question: "What prerequisite am I missing?",
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      title: "Prerequisite Gap: Logarithms as Repeated Halving ($2^k = n \\iff k = \\log_2 n$)",
      description: "Before mastering AVL tree balance and Master Theorem proofs, solidify why dividing by 2 leads directly to logarithmic complexity.",
      actionText: "Review Foundational Logarithm Proof",
      actionPayload: { title: "LaTeX Proof", visual_type: "mathematical_derivation" }
    },
    ready_for_next: {
      question: "Am I ready for the next topic?",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
      title: "Readiness Check: 75% Ready for Binary Search Trees",
      description: "You have mastered Sorted Array lookups (88%), but need to clear pointer off-by-one errors before unlocking Tree Traversals.",
      actionText: "Take 3-min Readiness Quiz",
      actionPayload: { title: "BST Trees", visual_type: "data_structure" }
    },
    where_losing_marks: {
      question: "Where am I losing marks?",
      icon: TrendingDown,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
      title: "Mark Loss Diagnostic: Boundary Edge Cases (-18%)",
      description: "65% of incorrect answers stem from failing to test array length 1 or target element at index 0.",
      actionText: "Practice Edge Case Traps",
      actionPayload: { title: "Trade-offs Matrix", visual_type: "comparison" }
    }
  };

  const currentInsight = mentorInsights[activeQuestion] || mentorInsights.what_to_study;
  const InsightIcon = currentInsight.icon;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-text">
      
      {/* Header */}
      <div className="p-4 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Proactive Study Navigator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Personal Mentor
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Personalized guidance answering what to study, revise, and fix next
            </p>
          </div>
        </div>

        {/* Daily Streak & Progress */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 font-bold text-[11px]">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>4-Day Streak</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400">Daily Goal:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-[11px]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 5 cols (6 Core Questions) & Right 7 cols (Today's Mentor Path & Insights) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-4 overflow-y-auto">
        
        {/* LEFT COLUMN (5 cols): 6 Core Mentor Questions */}
        <div className="lg:col-span-5 flex flex-col space-y-2.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">
            Ask Your Mentor:
          </span>

          {Object.entries(mentorInsights).map(([key, item]) => {
            const isSelected = activeQuestion === key;
            const Icon = item.icon;

            return (
              <button
                key={key}
                onClick={() => setActiveQuestion(key)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? "bg-white dark:bg-slate-950 border-brand-500 shadow-md shadow-brand-500/10 scale-[1.02]"
                    : "bg-white/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200/80 dark:border-slate-800/80"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-brand-500"}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isSelected ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.question}
                    </h4>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {item.title.split(":")[0]}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "text-brand-500 translate-x-0.5" : "text-slate-400"}`} />
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN (7 cols): Active Mentor Insight & Today's Personalized Study Path */}
        <div className="lg:col-span-7 flex flex-col space-y-3.5">
          
          {/* Active Question Insight Card */}
          <div className={`p-4 rounded-2xl border ${currentInsight.bg} shadow-sm space-y-2.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <InsightIcon className={`w-4 h-4 ${currentInsight.color}`} />
                <span className={`text-xs font-bold ${currentInsight.color}`}>
                  {currentInsight.question}
                </span>
              </div>
              <WhyRecommendationBadge
                type="topic"
                customReason={currentInsight.description}
                buttonText="Why?"
              />
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              <MathRenderer text={currentInsight.title} />
            </h4>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <MathRenderer text={currentInsight.description} />
            </p>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => onLaunchTask && onLaunchTask(currentInsight.actionPayload)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-transform hover:scale-105"
              >
                <span>{currentInsight.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onAskTutor && onAskTutor(currentInsight.question)}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Deep-dive in AI Tutor →
              </button>
            </div>
          </div>

          {/* TODAY'S PERSONALIZED STUDY PATH */}
          <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Today's Guided Mentor Path
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                {completedCount} of {dailyTasks.length} Completed
              </span>
            </div>

            {/* Task Checklist Sequence */}
            <div className="space-y-2.5 flex-1">
              {dailyTasks.map((task, idx) => (
                <div 
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed 
                      ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-60" 
                      : "bg-slate-50/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-brand-50/30 dark:hover:bg-brand-950/20"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="text-brand-600 dark:text-brand-400 hover:scale-110 transition-transform"
                    >
                      {task.completed ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-slate-400" />}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {idx + 1}. {task.title}
                        </span>
                        <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-[9px] font-mono text-slate-600 dark:text-slate-300">
                          {task.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <WhyRecommendationBadge
                      type={task.category === "revision" ? "revision" : task.category === "remediation" ? "practice_question" : task.category === "assessment" ? "quiz" : "topic"}
                      customReason={task.whyReason}
                      variant="icon"
                    />

                    <button
                      onClick={() => onLaunchTask && onLaunchTask({ title: task.title, visual_type: task.type })}
                      disabled={task.completed}
                      className="p-1.5 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg text-brand-600 dark:text-brand-400 text-xs font-bold transition-all disabled:opacity-30 flex items-center space-x-1"
                      title="Launch this task"
                    >
                      <Play className="w-3 h-3 fill-brand-600 dark:fill-brand-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Adaptive Mentor Feedback Note */}
            <div className="p-2.5 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl border border-brand-200/50 dark:border-brand-900/30 text-[10px] text-brand-800 dark:text-brand-300 flex items-center space-x-2">
              <Lightbulb className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span>
                <strong>Mentor Adaptation:</strong> Completing tasks automatically advances your readiness score and unlocks tree traversal topics.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudyNavigator;
