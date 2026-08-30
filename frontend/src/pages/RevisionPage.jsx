import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  Loader2, 
  AlertTriangle,
  FileDown,
  RotateCcw
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";
import MarkdownRenderer from "../components/common/MarkdownRenderer";

const RevisionPage = () => {
  const { activeDocument } = useDocuments();
  const [activeTab, setActiveTab] = useState("last_minute");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [revisions, setRevisions] = useState({
    last_minute: "",
    cheat_sheet: "",
    important_questions: ""
  });

  useEffect(() => {
    const fetchExisting = async () => {
      if (!activeDocument) return;
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await studyService.getRevisionNotes(activeDocument.id);
        const map = { last_minute: "", cheat_sheet: "", important_questions: "" };
        data.forEach((r) => {
          if (map.hasOwnProperty(r.revision_type)) {
            map[r.revision_type] = r.content;
          }
        });
        setRevisions(map);
      } catch (err) {
        console.error("Failed to load revision notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [activeDocument]);

  const handleGenerate = async () => {
    if (!activeDocument) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await studyService.generateRevisionNotes(activeDocument.id, activeTab);
      setRevisions((prev) => ({
        ...prev,
        [activeTab]: result.content
      }));
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate revision sheet. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeDocument) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 animate-slide-up">
        <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
          <FileText className="h-8 w-8 animate-pulse-subtle" />
        </div>
        <h3 className="font-display text-base font-bold text-slate-100">Select Study Document</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Open the navigation and select an active guide to compile dense last-minute revision notes and exam cheat sheets.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "last_minute", name: "Last-Minute High-Yield" },
    { id: "cheat_sheet", name: "Formula & Cheat Sheet" },
    { id: "important_questions", name: "Core Exam Q&A" }
  ];

  const currentContent = revisions[activeTab];

  return (
    <div className="space-y-6 pb-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">Revision Sheets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing: <span className="font-semibold text-sky-400">{activeDocument.filename}</span>
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          <span>{currentContent ? "Regenerate" : "Generate Sheet"}</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-white/[0.08] overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setErrorMsg("");
            }}
            className={`px-5 py-3 text-xs font-semibold font-mono border-b-2 transition-all -mb-px shrink-0 ${
              activeTab === t.id
                ? "border-sky-400 text-sky-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Main Content Render Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative min-h-[350px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-3xl space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <p className="text-xs font-semibold text-slate-200">Compiling revision cheat sheet with Gemini...</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 flex items-center space-x-2 text-xs text-rose-400 font-semibold bg-rose-500/10 px-4 py-3 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {currentContent ? (
          <div className="max-w-none select-text">
            <MarkdownRenderer content={currentContent} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-4 max-w-sm mx-auto">
            <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
              <Sparkles className="h-7 w-7 animate-pulse-subtle" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-slate-100">No revision sheet compiled</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to synthesize a dense, high-yield {tabs.find(t => t.id === activeTab)?.name.toLowerCase()}.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              <FileDown className="h-4 w-4" />
              <span>Compile {tabs.find(t => t.id === activeTab)?.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionPage;
