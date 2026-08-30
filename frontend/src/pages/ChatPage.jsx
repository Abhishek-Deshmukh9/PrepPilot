import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  Send,
  Loader2,
  Trash2,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  AlertTriangle,
  RotateCcw,
  PanelRightOpen,
  PanelRightClose,
  Lightbulb,
  HelpCircle,
  BookOpenCheck,
  GraduationCap,
  FlaskConical,
  Info,
  Copy,
  Check,
  MessageSquare
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import chatService from "../services/chatService";
import { MathRenderer } from "../components/common/MathRenderer";
import VisualCanvas from "../components/canvas/VisualCanvas";

// ─── Tutor Mode Configuration ───────────────────────────────────────────────
const TUTOR_MODES = [
  {
    id: "socratic",
    label: "Socratic",
    description: "Guided discovery through questions",
    icon: GraduationCap,
    color: "text-purple-400",
    bg: "bg-purple-950/30 border-purple-500/20 text-purple-300",
    activeBg: "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20"
  },
  {
    id: "direct",
    label: "Direct",
    description: "Clear, structured explanation",
    icon: BookOpenCheck,
    color: "text-sky-400",
    bg: "bg-sky-950/30 border-sky-500/20 text-sky-300",
    activeBg: "bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20"
  },
  {
    id: "exam_cram",
    label: "Exam Cram",
    description: "High-yield bullets & formulas only",
    icon: Sparkles,
    color: "text-amber-400",
    bg: "bg-amber-950/30 border-amber-500/20 text-amber-300",
    activeBg: "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20"
  },
  {
    id: "eli5",
    label: "ELI5",
    description: "Simple language & analogies",
    icon: Lightbulb,
    color: "text-emerald-400",
    bg: "bg-emerald-950/30 border-emerald-500/20 text-emerald-300",
    activeBg: "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
  },
  {
    id: "worked_example",
    label: "Worked Example",
    description: "Step-by-step with calculations",
    icon: FlaskConical,
    color: "text-rose-400",
    bg: "bg-rose-950/30 border-rose-500/20 text-rose-300",
    activeBg: "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/20"
  }
];

// ─── Inline Markdown + Math renderer ────────────────────────────────────────
const MessageContent = ({ text }) => {
  if (!text) return null;
  return (
    <div className="space-y-2 leading-relaxed">
      <MathRenderer text={text} />
    </div>
  );
};

// ─── Source Citation Card ────────────────────────────────────────────────────
const SourceCard = ({ source, index }) => {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round((source.score || 0) * 100);
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden text-[10px]">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-300 truncate max-w-[180px]">
            {source.filename || "Document Source"}
          </span>
          {source.page && (
            <span className="px-1.5 py-0.2 bg-sky-500/10 text-sky-300 rounded font-mono font-bold">
              p.{source.page}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-400 font-mono">{score}% match</span>
          {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-3 py-2.5 bg-black/30 text-slate-300 leading-relaxed border-t border-white/[0.06] font-mono text-[10px]">
          {source.text_snippet}
        </div>
      )}
    </div>
  );
};

// ─── Main Chat Page ──────────────────────────────────────────────────────────
const ChatPage = () => {
  const { activeDocument } = useDocuments();

  const [sessionId] = useState(() => {
    let saved = localStorage.getItem("preppilot_chat_session");
    if (!saved) {
      saved = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("preppilot_chat_session", saved);
    }
    return saved;
  });

  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState("direct");
  const [showCanvas, setShowCanvas] = useState(false);
  const [visualPayload, setVisualPayload] = useState(null);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (questionText) => {
    const text = (questionText || inputQuestion).trim();
    if (!text || isLoading) return;

    setInputQuestion("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      const response = await chatService.query({
        sessionId,
        documentId: activeDocument?.id || null,
        question: text,
        topK: 5,
        tutorMode
      });

      const aiMsg = {
        role: "ai",
        text: response.answer || "",
        sources: response.sources || [],
        prerequisite_diagnosis: response.prerequisite_diagnosis,
        visual_payload: response.visual_payload,
        visual_type: response.visual_type,
        smart_notes: response.smart_notes,
        followup_questions: response.followup_questions || []
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Auto-open visual canvas if a visual payload came back
      if (response.visual_payload) {
        setVisualPayload(response.visual_payload);
        setShowCanvas(true);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I encountered an error processing your question. Please check your connection or try again.",
          sources: [],
          followup_questions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputQuestion, isLoading, sessionId, activeDocument, tutorMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleClearHistory = () => {
    if (window.confirm("Reset this study session and clear chat history?")) {
      setMessages([]);
      setVisualPayload(null);
      setShowCanvas(false);
      setError("");
    }
  };

  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (_) {}
  };

  const currentMode = TUTOR_MODES.find((m) => m.id === tutorMode) || TUTOR_MODES[1];
  const ModeIcon = currentMode.icon;

  // ─── Quick Prompt Chips ────────────────────────────────────────────────────
  const quickChips = [
    { label: "Summarize core concepts", prompt: "Summarize the key points and core concepts from this document" },
    { label: "Define essential formulas", prompt: "What are the most important terms, formulas, and definitions in this document?" },
    { label: "Generate practice exam questions", prompt: "What exam questions might be asked about this material?" },
    { label: "Explain in simple terms (ELI5)", prompt: "Explain the main thesis and core idea of this document with intuitive analogies" },
    { label: "Show step-by-step worked example", prompt: "Walk me step-by-step through a concrete worked example based on this topic" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-3.5rem)] gap-0 animate-slide-up">

      {/* ── Header Bar ── */}
      <div className="shrink-0 px-2 sm:px-4 pt-1 pb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight flex items-center gap-2">
              <span>Ask AI Anything</span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold uppercase">
                {currentMode.label}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {activeDocument
                ? `Active Context: ${activeDocument.filename}`
                : "General Academic Tutor (Upload a guide for cited answers)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Canvas Toggle */}
          <button
            onClick={() => setShowCanvas((s) => !s)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showCanvas
                ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20"
            }`}
          >
            {showCanvas ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCanvas ? "Hide Canvas" : "Visual Canvas"}</span>
          </button>

          {/* Clear History */}
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
              title="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tutor Mode Selector ── */}
      <div className="shrink-0 px-2 sm:px-4 pb-3">
        <div className="glass-panel rounded-2xl p-2 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500 shrink-0 px-2">
              MODE:
            </span>
            {TUTOR_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = tutorMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setTutorMode(mode.id)}
                  title={mode.description}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                    isActive
                      ? `${mode.activeBg}`
                      : `${mode.bg} hover:border-white/30`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content: Chat Stream + Canvas ── */}
      <div className="flex-1 flex gap-4 px-2 sm:px-4 pb-2 min-h-0">

        {/* Chat Column */}
        <div className={`flex flex-col min-h-0 transition-all duration-300 ${showCanvas ? "flex-[2] min-w-0" : "flex-1"}`}>
          <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden">

            {/* No Document Banner */}
            {!activeDocument && (
              <div className="mx-4 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">No study guide selected</p>
                  <p className="text-amber-200/80 mt-0.5 text-[11px]">
                    Select an uploaded document in the top navbar to get answers grounded in your notes with page citations. You can still ask any general academic question right now.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
              {messages.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-4 max-w-md mx-auto">
                  <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
                    <MessageSquare className="w-8 h-8 animate-pulse-subtle" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-100 mb-1">
                      {activeDocument ? `Ask anything from "${activeDocument.filename}"` : "Ask any academic concept"}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      {activeDocument
                        ? "Answers will cite exact source chunks and page numbers from your uploaded document."
                        : "Choose a tutor mode above to tailor explanations from high-yield cramming to deep Socratic guidance."}
                    </p>
                  </div>

                  {/* Quick Start Chips */}
                  <div className="w-full space-y-2 pt-2">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left">
                      QUICK INQUIRIES:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {quickChips.map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => sendMessage(chip.prompt)}
                          disabled={isLoading}
                          className="w-full text-left px-3.5 py-2.5 bg-white/[0.03] hover:bg-sky-500/10 border border-white/[0.06] hover:border-sky-500/30 rounded-xl text-xs text-slate-300 font-medium transition-all flex items-center justify-between group disabled:opacity-50"
                        >
                          <span>{chip.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Message Bubbles */
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {/* Bubble */}
                      <div
                        className={`max-w-[92%] rounded-2xl text-xs shadow-md ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-3 font-medium shadow-sky-500/10"
                            : "bg-[#0c1017] border border-white/[0.08] text-slate-100 px-4 sm:px-5 py-4 space-y-3.5"
                        }`}
                      >
                        {/* AI Header */}
                        {msg.role === "ai" && (
                          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                            <div className="flex items-center space-x-2 text-[11px] font-bold text-sky-400">
                              <ModeIcon className="w-3.5 h-3.5" />
                              <span className="font-mono text-[10px] tracking-wider uppercase">PrepPilot AI · {currentMode.label}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(msg.text, idx)}
                              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200"
                              title="Copy answer"
                            >
                              {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}

                        {/* Message Text */}
                        <div className="leading-relaxed select-text text-slate-200 text-xs sm:text-sm">
                          <MessageContent text={msg.text} />
                        </div>

                        {/* AI Extras */}
                        {msg.role === "ai" && (
                          <>
                            {/* Prerequisites / Diagnosis */}
                            {msg.prerequisite_diagnosis && (
                              <div className="flex items-start space-x-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px]">
                                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-amber-300">Prerequisite Concept Insight</p>
                                  <p className="text-amber-200/90 mt-0.5">{msg.prerequisite_diagnosis}</p>
                                </div>
                              </div>
                            )}

                            {/* Visual Canvas Trigger */}
                            {msg.visual_payload && (
                              <button
                                onClick={() => {
                                  setVisualPayload(msg.visual_payload);
                                  setShowCanvas(true);
                                }}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-xs font-bold text-sky-300 transition-colors group"
                              >
                                <div className="flex items-center space-x-2">
                                  <Layers className="w-4 h-4 text-sky-400" />
                                  <span>Launch {msg.visual_payload?.title || "Visual Model"} on Canvas</span>
                                </div>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            )}

                            {/* Source Citations */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                  DOCUMENT CITATIONS ({msg.sources.length})
                                </p>
                                {msg.sources.map((src, sIdx) => (
                                  <SourceCard key={sIdx} source={src} index={sIdx} />
                                ))}
                              </div>
                            )}

                            {/* Follow-up Question Chips */}
                            {msg.followup_questions && msg.followup_questions.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                                {msg.followup_questions.map((q, qIdx) => (
                                  <button
                                    key={qIdx}
                                    onClick={() => sendMessage(q)}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-sky-500/10 border border-white/[0.08] hover:border-sky-500/30 text-slate-300 hover:text-sky-300 rounded-xl text-[11px] font-medium transition-all flex items-center space-x-1.5 disabled:opacity-50"
                                  >
                                    <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                                    <span><MathRenderer text={q} /></span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-[#0c1017] border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center space-x-2.5 text-xs text-slate-400 shadow-md">
                        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                        <span>Generating response in <span className="font-semibold text-sky-300">{currentMode.label}</span> mode...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mx-4 mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-300">{error}</p>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 p-3 bg-[#07090e]/90 border-t border-white/[0.06] flex items-center space-x-2"
            >
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={
                    activeDocument
                      ? `Ask about "${activeDocument.filename}"...`
                      : "Ask any academic concept..."
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-xs bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] focus:border-sky-500/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-[#0c1017] transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Visual Canvas Drawer */}
        {showCanvas && (
          <div className="flex-[3] min-w-0 min-h-0 transition-all duration-300">
            <VisualCanvas
              visualPayload={visualPayload}
              activeTopic={activeDocument?.filename || "Study Session"}
              onComponentClick={async (data) => {
                await sendMessage(
                  `Explain this component: ${data.component || data.role || JSON.stringify(data)}`
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
