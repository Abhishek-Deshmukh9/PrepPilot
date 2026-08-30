import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Trash2, 
  BookOpen, 
  Target,
  Zap,
  Layers,
  ChevronRight,
  User,
  Compass,
  FileQuestion,
  RotateCcw
} from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";
import TutorDecisionBanner from "./TutorDecisionBanner";
import WhyRecommendationBadge from "./WhyRecommendationBadge";

export const AITutorChat = ({
  messages = [],
  onSendMessage = null,
  isLoading = false,
  activeTopic = "Binary Search Complexity",
  studentState = {
    mastery: 70,
    confidenceLevel: "Medium",
    prerequisiteMissing: "Logarithm as Inverse of Exponential Halving ($2^k = n \\implies k = \\log_2 n$)"
  },
  learnerProfile = null,
  onTriggerVisual = null,
  onClearHistory = null,
  className = ""
}) => {
  const [inputQuestion, setInputQuestion] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll chat pane to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;
    if (onSendMessage) {
      onSendMessage(inputQuestion.trim());
    }
    setInputQuestion("");
  };

  const handleChipClick = (promptText) => {
    if (onSendMessage && !isLoading) {
      onSendMessage(promptText);
    }
  };

  // Conversational Quick Actions
  const quickActionPrompts = [
    { label: "Explain simply", prompt: "Explain this more simply", icon: Lightbulb },
    { label: "Why divide by 2?", prompt: "Why do we divide by 2?", icon: HelpCircle },
    { label: "Give example", prompt: "Give me an example", icon: BookOpen },
    { label: "Quiz me", prompt: "Quiz me", icon: FileQuestion },
    { label: "Show visually", prompt: "Show me visually", icon: Layers },
    { label: "Like beginner", prompt: "Explain this like I'm a beginner", icon: Brain }
  ];

  return (
    <div className={`flex flex-col h-full bg-white/80 dark:bg-slate-900/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden backdrop-blur-xl ${className}`}>
      
      {/* Top Learning State HUD */}
      <div className="p-3.5 bg-white/95 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  AI Learning Companion
                </h3>
                <span className="px-1.5 py-0.2 bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-full text-[9px] font-bold border border-brand-200 dark:border-brand-800">
                  {learnerProfile?.name || "Personalized Tutor"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-56">
                Topic: {activeTopic}
              </p>
            </div>
          </div>

          {/* Clear Session */}
          {messages.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg text-xs transition-colors"
              title="Reset Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3 max-w-sm mx-auto">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-2xl text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/30">
              <Sparkles className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {learnerProfile?.name || "Personal Learning Tutor"}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ask any question or pick an action to begin your personalized learning loop.
            </p>

            {/* Quick Starters */}
            <div className="w-full space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-left">
                Suggested Questions:
              </span>
              {quickActionPrompts.slice(0, 4).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(item.prompt)}
                  className="w-full p-2 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/30 border border-slate-200/60 dark:border-slate-800 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{item.prompt}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`max-w-[94%] rounded-2xl p-3.5 text-xs shadow-xs select-text ${
                    msg.sender === "user"
                      ? "bg-brand-600 text-white font-medium"
                      : "bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-2.5"
                  }`}
                >
                  {/* Sender Header for AI */}
                  {msg.sender === "ai" && (
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <Brain className="w-3 h-3" />
                      <span>PrepPilot AI Companion</span>
                    </div>
                  )}

                  {/* Explicit Pedagogical Tutor Decision Banner */}
                  {msg.sender === "ai" && (msg.tutorRationale || learnerProfile?.tutorRationale) && (
                    <TutorDecisionBanner
                      rationale={msg.tutorRationale || learnerProfile?.tutorRationale}
                      style={learnerProfile?.preferredExplanationStyle || "visual"}
                      archetypeName={learnerProfile?.name || "Student Profile"}
                      weakConcepts={learnerProfile?.weakConcepts || []}
                      prerequisiteGaps={learnerProfile?.prerequisiteGaps || []}
                    />
                  )}

                  {/* Main Message Text (Markdown + KaTeX) */}
                  <div className="leading-relaxed">
                    <MathRenderer text={msg.text} compact />
                  </div>

                  {/* Canvas Visual Trigger Button with Why This Badge */}
                  {msg.sender === "ai" && msg.visualPayload && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => onTriggerVisual && onTriggerVisual(msg.visualPayload)}
                        className="flex-1 p-2 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 rounded-xl text-[11px] font-bold text-brand-700 dark:text-brand-300 flex items-center justify-between transition-colors shadow-2xs group"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-brand-500" />
                          <span>Open {msg.visualPayload.title || "Visual Model"} on Canvas</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <WhyRecommendationBadge
                        type="visual_explanation"
                        customReason="Recommended because you learn this type of concept better through visual examples."
                        historyEvidence="Profile indicates high visual retention on animated step-by-step models."
                        buttonText="Why?"
                      />
                    </div>
                  )}

                  {/* Proactive Next Action Buttons below AI explanation */}
                  {msg.sender === "ai" && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleChipClick("Show me visually")}
                        className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 rounded-lg text-[10px] font-bold border border-brand-200/60 dark:border-brand-800 flex items-center space-x-1 transition-all"
                      >
                        <Layers className="w-3 h-3 text-brand-500" />
                        <span>Show me visually</span>
                      </button>

                      <button
                        onClick={() => handleChipClick("Give me an example")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center space-x-1 transition-all"
                      >
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        <span>Give me an example</span>
                      </button>

                      <button
                        onClick={() => handleChipClick("Quiz me")}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800 flex items-center space-x-1 transition-all"
                      >
                        <FileQuestion className="w-3 h-3 text-emerald-500" />
                        <span>Test my understanding</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Follow-up / Practice Questions with Why Badge */}
                {msg.sender === "ai" && msg.followupQuestions && msg.followupQuestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 max-w-[94%]">
                    {msg.followupQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="inline-flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => handleChipClick(q)}
                          className="px-2 py-1 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-200 hover:text-brand-600 text-[10px] font-medium rounded-md transition-colors flex items-center space-x-1"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                          <span><MathRenderer text={q} /></span>
                        </button>
                        <WhyRecommendationBadge
                          type={qIdx === 0 ? "practice_question" : "prerequisite"}
                          customReason={qIdx === 0 ? "Recommended because you struggled with this concept twice." : "Recommended because this is a prerequisite for the topic you're currently studying."}
                          variant="icon"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center space-x-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span>AI Tutor is formulating explanation for your profile...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fast Prompt Pills Bar */}
      <div className="px-3 py-1.5 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
        {quickActionPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleChipClick(item.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/80 dark:border-slate-700 rounded-xl text-[10px] font-bold shrink-0 transition-colors flex items-center space-x-1 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-slate-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask your AI Tutor anything (e.g. 'Why do we divide by 2?')..."
          disabled={isLoading}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-2xl text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
          title="Send (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AITutorChat;
