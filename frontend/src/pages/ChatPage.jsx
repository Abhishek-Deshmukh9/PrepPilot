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
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    activeBg: "bg-purple-600 text-white border-purple-600 shadow-purple-500/20"
  },
  {
    id: "direct",
    label: "Direct",
    description: "Clear, structured explanation",
    icon: BookOpenCheck,
    color: "text-brand-600 dark:text-brand-400",
    bg: "bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800",
    activeBg: "bg-brand-600 text-white border-brand-600 shadow-brand-500/20"
  },
  {
    id: "exam_cram",
    label: "Exam Cram",
    description: "High-yield bullets & formulas only",
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    activeBg: "bg-amber-500 text-white border-amber-500 shadow-amber-500/20"
  },
  {
    id: "eli5",
    label: "ELI5",
    description: "Simple language & analogies",
    icon: Lightbulb,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    activeBg: "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20"
  },
  {
    id: "worked_example",
    label: "Worked Example",
    description: "Step-by-step with calculations",
    icon: FlaskConical,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    activeBg: "bg-rose-600 text-white border-rose-600 shadow-rose-500/20"
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
    <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden text-[10px]">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-left"
      >
        <div className="flex items-center space-x-2">
          <FileText className="w-3 h-3 text-brand-500 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-40">
            {source.filename || "Document"}
          </span>
          {source.page && (
            <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded font-bold">
              p.{source.page}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-400">{score}% match</span>
          {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-2.5 py-2 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
          {source.text_snippet}
        </div>
      )}
    </div>
  );
};

// ─── Main Chat Page ──────────────────────────────────────────────────────────
const ChatPage = () => {
  const { activeDocument } = useDocuments();

  const [sessionId, setSessionId] = useState(() => {
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

  // Load previous chat history from backend on mount or session change
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatService.getHistory(sessionId);
        if (history && history.length > 0) {
          const restored = [];
          for (const h of history) {
            restored.push({ role: "user", text: h.question });
            restored.push({
              role: "ai",
              text: h.answer,
              sources: h.sources || [],
              isGrounded: !!(h.sources && h.sources.length > 0),
              followup_questions: []
            });
          }
          setMessages(restored);
        }
      } catch (err) {
        console.warn("Could not load chat history:", err);
        // Non-blocking — start fresh if history load fails
      }
    };
    loadHistory();
  }, [sessionId]);

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
        isGrounded: !!(activeDocument && response.sources && response.sources.length > 0),
        prerequisite_diagnosis: response.prerequisite_diagnosis,
        visual_payload: response.visual_payload,
        visual_type: response.visual_type,
        smart_notes: response.smart_notes,
        followup_questions: response.followup_questions || []
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Auto-open visual canvas if a visual payload came back
      if (response.visual_payload) {
        // Ensure visual_type is always inside the payload for VisualCanvas tab sync
        const payload = {
          ...response.visual_payload,
          visual_type: response.visual_payload.visual_type || response.visual_type
        };
        setVisualPayload(payload);
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

  const handleClearHistory = async () => {
    if (!window.confirm("Reset this study session and clear chat history?")) return;

    try {
      await chatService.clearHistory(sessionId);
    } catch (err) {
      console.warn("Could not clear backend history:", err);
    }

    // Clear local state
    setMessages([]);
    setVisualPayload(null);
    setShowCanvas(false);
    setError("");

    // Generate a new session ID so cleared history doesn't reload
    const newSession = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("preppilot_chat_session", newSession);
    setSessionId(newSession);
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
    { label: "Summarize this", prompt: "Summarize the key points from this document" },
    { label: "Define key terms", prompt: "What are the most important terms and definitions in this document?" },
    { label: "What are the main concepts?", prompt: "What are the main concepts I need to understand from this document?" },
    { label: "Give me exam questions", prompt: "What types of questions might appear in an exam on this material?" },
    { label: "Explain simply", prompt: "Explain the core idea of this document in simple terms" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-3rem)] gap-0">

      {/* ── Header Bar ── */}
      <div className="shrink-0 px-4 pt-1 pb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Ask AI Anything
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              {activeDocument
                ? `Studying: ${activeDocument.filename}`
                : "Upload a document to get document-grounded answers"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Canvas Toggle */}
          <button
            onClick={() => setShowCanvas((s) => !s)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showCanvas
                ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300"
            }`}
          >
            {showCanvas ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCanvas ? "Hide Canvas" : "Visual Canvas"}</span>
          </button>

          {/* Clear History */}
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-200/50"
              title="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tutor Mode Selector ── */}
      <div className="shrink-0 px-4 pb-3">
        <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-2 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0 px-1">
              Tutor Mode:
            </span>
            {TUTOR_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = tutorMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setTutorMode(mode.id)}
                  title={mode.description}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 border transition-all ${
                    isActive
                      ? `${mode.activeBg} shadow-md`
                      : `${mode.bg} ${mode.color} hover:opacity-80`
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content: Chat + Canvas ── */}
      <div className="flex-1 flex gap-4 px-4 pb-4 min-h-0">

        {/* Chat Column */}
        <div className={`flex flex-col min-h-0 transition-all duration-300 ${showCanvas ? "flex-[2] min-w-0" : "flex-1"}`}>
          <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md backdrop-blur-xl overflow-hidden">

            {/* No Document Banner */}
            {!activeDocument && (
              <div className="mx-4 mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start space-x-2.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">No document selected</p>
                  <p className="text-amber-600 dark:text-amber-400 mt-0.5">
                    Select or upload a document from the navbar to get answers grounded in your study material with page citations.
                    You can still ask general academic questions without a document.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-4 max-w-sm mx-auto">
                  <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-2xl text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/30">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {activeDocument ? `Ask about "${activeDocument.filename}"` : "Ask any academic question"}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {activeDocument
                        ? "Your answers will be grounded in your uploaded document with page number citations."
                        : "Upload a document to get precise, cited answers from your study material."}
                    </p>
                  </div>

                  {/* Quick Start Chips */}
                  <div className="w-full space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Quick questions:
                    </p>
                    {quickChips.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => sendMessage(chip.prompt)}
                        disabled={isLoading}
                        className="w-full text-left px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/30 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center justify-between group disabled:opacity-50"
                      >
                        <span>{chip.label}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-brand-500 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message Bubbles */
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {/* Bubble */}
                      <div
                        className={`max-w-[90%] rounded-2xl text-xs shadow-sm ${
                          msg.role === "user"
                            ? "bg-brand-600 text-white px-4 py-3 font-medium"
                            : "bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 px-4 py-3 space-y-3"
                        }`}
                      >
                        {/* AI Header */}
                        {msg.role === "ai" && (
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                              <ModeIcon className="w-3 h-3" />
                              <span>PrepPilot AI · {currentMode.label} mode</span>
                              {msg.isGrounded === false && (
                                <span className="ml-1.5 inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-medium">
                                  <HelpCircle className="w-2.5 h-2.5" />
                                  <span>General knowledge</span>
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleCopy(msg.text, idx)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
                              title="Copy answer"
                            >
                              {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {/* Message Text */}
                        <div className="leading-relaxed select-text">
                          <MessageContent text={msg.text} />
                        </div>

                        {/* AI Extras */}
                        {msg.role === "ai" && (
                          <>
                            {/* Prerequisites / Diagnosis */}
                            {msg.prerequisite_diagnosis && (
                              <div className="flex items-start space-x-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[10px]">
                                <Info className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-amber-700 dark:text-amber-300">Prerequisite / Confusion Point</p>
                                  <p className="text-amber-600 dark:text-amber-400 mt-0.5">{msg.prerequisite_diagnosis}</p>
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
                                className="w-full flex items-center justify-between px-3 py-2 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 rounded-xl text-[11px] font-bold text-brand-700 dark:text-brand-300 transition-colors group"
                              >
                                <div className="flex items-center space-x-1.5">
                                  <Layers className="w-3.5 h-3.5 text-brand-500" />
                                  <span>Open {msg.visual_payload?.title || "Visual Model"} on Canvas</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            )}

                            {/* Source Citations */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Document Sources ({msg.sources.length})
                                </p>
                                {msg.sources.map((src, sIdx) => (
                                  <SourceCard key={sIdx} source={src} index={sIdx} />
                                ))}
                              </div>
                            )}

                            {/* Follow-up Question Chips */}
                            {msg.followup_questions && msg.followup_questions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                                {msg.followup_questions.map((q, qIdx) => (
                                  <button
                                    key={qIdx}
                                    onClick={() => sendMessage(q)}
                                    disabled={isLoading}
                                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg text-[10px] font-medium transition-all flex items-center space-x-1 disabled:opacity-50"
                                  >
                                    <Sparkles className="w-2.5 h-2.5 text-brand-400 shrink-0" />
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
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center space-x-2 text-xs text-slate-400 shadow-sm">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                        <span>Thinking in <span className="font-semibold text-brand-600 dark:text-brand-400">{currentMode.label}</span> mode...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mx-4 mb-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start space-x-2 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 p-3 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-2"
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
                      : "Ask any academic question..."
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
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
