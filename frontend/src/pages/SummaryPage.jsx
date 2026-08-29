import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Loader2, 
  AlertTriangle,
  FileDown,
  RotateCcw
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";

const SummaryPage = () => {
  const { activeDocument } = useDocuments();
  const [activeTab, setActiveTab] = useState("executive");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [summaries, setSummaries] = useState({
    executive: "",
    detailed: "",
    revision: ""
  });

  // Fetch existing summaries on mount or doc change
  useEffect(() => {
    const fetchExisting = async () => {
      if (!activeDocument) return;
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await studyService.getSummaries(activeDocument.id);
        const map = { executive: "", detailed: "", revision: "" };
        data.forEach((s) => {
          if (map.hasOwnProperty(s.summary_type)) {
            map[s.summary_type] = s.content;
          }
        });
        setSummaries(map);
      } catch (err) {
        console.error("Failed to load summaries:", err);
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
      const result = await studyService.generateSummary(activeDocument.id, activeTab);
      setSummaries((prev) => ({
        ...prev,
        [activeTab]: result.content
      }));
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown-to-HTML parser to display formatted summaries
  const renderMarkdown = (text) => {
    if (!text) return "";
    
    // Split lines
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="font-display text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{trimmed.replace("###", "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="font-display text-md font-extrabold text-slate-900 dark:text-slate-100 mt-5 mb-2.5 border-b border-slate-100 dark:border-slate-800 pb-1">{trimmed.replace("##", "").trim()}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="font-display text-lg font-black text-slate-900 dark:text-slate-50 mt-6 mb-3">{trimmed.replace("#", "").trim()}</h2>;
      }
      
      // Bullets
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        // Parse bold text **word**
        const rawContent = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-600 dark:text-slate-400 mb-1.5 leading-relaxed">
            {parseBold(rawContent)}
          </li>
        );
      }
      
      // Paragraph
      if (trimmed === "") return <div key={idx} className="h-2" />;
      
      return <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">{parseBold(trimmed)}</p>;
    });
  };

  // Inline bold parser
  const parseBold = (content) => {
    const parts = content.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-800 dark:text-slate-200">{part}</strong>;
      }
      return part;
    });
  };

  if (!activeDocument) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-full text-amber-500 border border-amber-100/50 dark:border-amber-900/30">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="font-display text-md font-bold">Select Document to Summarize</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          Open the sidebar and pick a study guide. Once active, this tool scan notes and organizes high-yield summaries.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "executive", name: "Executive Summary" },
    { id: "detailed", name: "Detailed Structure" },
    { id: "revision", name: "High-Yield Sheet" }
  ];

  const currentSummary = summaries[activeTab];

  return (
    <div className="space-y-6">
      {/* Header details */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Summary Generator</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing document: <span className="font-semibold text-brand-500">{activeDocument.filename}</span>
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          <span>{currentSummary ? "Regenerate" : "Generate Summary"}</span>
        </button>
      </div>

      {/* Selector Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setErrorMsg("");
            }}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all -mb-px ${
              activeTab === t.id
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Main Content Render Box */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-sm relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm z-10 rounded-3xl">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Summarizing nodes with Gemini...</p>
          </div>
        ) : null}

        {errorMsg && (
          <div className="mb-4 flex items-center space-x-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2.5 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {currentSummary ? (
          <div className="prose dark:prose-invert max-w-none space-y-1 font-sans">
            {renderMarkdown(currentSummary)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-4 max-w-sm mx-auto">
            <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-full text-brand-600 dark:text-brand-400">
              <Sparkles className="h-6 w-6 animate-pulse-subtle" />
            </div>
            <h3 className="font-display text-sm font-bold">No summary compiled</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Compile notes under this tab format. PrepPilot triggers Gemini API parsing to generate the requested summary layout.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileDown className="h-4 w-4" />
              <span>Compile Summary</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPage;
