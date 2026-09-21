import React, { useState, useEffect } from "react";
import {
  Zap,
  FileText,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Target,
  BookOpen,
  Star,
  Hash,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";
import { MathRenderer } from "../components/common/MathRenderer";
import MarkdownRenderer from "../components/common/MarkdownRenderer";

// ─── Priority Badge ──────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const styles = {
    critical: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    high: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    medium: "bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800",
    low: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
  };
  const icons = { critical: "🔴", high: "🟡", medium: "🔵", low: "⚪" };
  const p = (priority || "medium").toLowerCase();
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[p] || styles.medium}`}>
      <span>{icons[p] || icons.medium}</span>
      <span className="capitalize">{p}</span>
    </span>
  );
};

// ─── Key Point Card ──────────────────────────────────────────────────────────
const KeyPointCard = ({ point, index }) => {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${point.concept || point.title}\n\n${point.explanation || point.content}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300/60 dark:hover:border-brand-800/60 transition-all">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-xl bg-brand-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-brand-500/20">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                <MarkdownRenderer content={point.concept || point.title || `Key Point ${index + 1}`} compact />
              </div>
              {point.priority && <PriorityBadge priority={point.priority} />}
              {point.category && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                  {point.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            title="Copy this key point"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Main explanation */}
          {(point.explanation || point.content) && (
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/80 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
              <MathRenderer text={point.explanation || point.content} />
            </div>
          )}

          {/* Example if available */}
          {point.example && (
            <div className="text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Example</p>
              <MathRenderer text={point.example} />
            </div>
          )}

          {/* Formula if available */}
          {point.formula && (
            <div className="text-xs bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Formula / Notation</p>
              <MathRenderer text={point.formula} />
            </div>
          )}

          {/* Memory tip if available */}
          {point.memory_tip && (
            <div className="text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">💡 Memory Tip</p>
              <div className="text-amber-800 dark:text-amber-300">
                <MarkdownRenderer content={point.memory_tip} compact />
              </div>
            </div>
          )}

          {/* Tags */}
          {point.tags && point.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {point.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-semibold border border-slate-200 dark:border-slate-700"
                >
                  <Hash className="w-2 h-2" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Key Points Page ────────────────────────────────────────────────────
const KeyPointsPage = () => {
  const { activeDocument } = useDocuments();
  const [keyPoints, setKeyPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Map backend category names to priority levels
  const categoryPriorityMap = {
    "Formulas": "critical",
    "Formula": "critical",
    "Definitions": "high",
    "Definition": "high",
    "Concepts": "high",
    "Concept": "high",
    "Facts": "medium",
    "Fact": "medium",
    "Tips": "medium",
    "Exam Tips": "medium",
    "Examples": "low",
    "Example": "low",
  };

  // Transform backend response to display-ready format
  const transformKeyPoints = (rawKeypoints) => {
    // rawKeypoints: [{ category: string, points: string[] }]
    const cards = [];
    rawKeypoints.forEach((group) => {
      const priority = categoryPriorityMap[group.category] || "medium";
      (group.points || []).forEach((point) => {
        cards.push({
          category: group.category,
          concept: point,
          explanation: null, // Backend doesn't provide separate explanation
          priority,
          tags: [],
        });
      });
    });
    return cards;
  };

  const handleGenerate = async () => {
    if (!activeDocument) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await studyService.generateKeyPoints(activeDocument.id);
      // Backend returns: { document_id, keypoints: [{ category, points: [] }] }
      const rawKeypoints = result.keypoints || result.key_points || [];
      const cards = transformKeyPoints(rawKeypoints);
      setKeyPoints(cards);
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate key points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset when document changes
  useEffect(() => {
    setKeyPoints([]);
    setErrorMsg("");
    setFilter("all");
    setSearchQuery("");
  }, [activeDocument]);

  // No document selected
  if (!activeDocument) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
        <div className="bg-brand-50 dark:bg-brand-950/20 p-4 rounded-full text-brand-500 border border-brand-100/50 dark:border-brand-900/30">
          <Zap className="h-6 w-6" />
        </div>
        <h3 className="font-display text-md font-bold">Select a Document</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          Choose a study document from the top navbar. PrepPilot will extract the most important concepts, formulas, and exam-critical ideas from it.
        </p>
      </div>
    );
  }

  // Filter and search
  const priorities = ["all", "critical", "high", "medium", "low"];
  const filteredPoints = keyPoints.filter((pt) => {
    const matchesPriority = filter === "all" || (pt.priority || "medium").toLowerCase() === filter;
    const matchesSearch = !searchQuery || [pt.concept, pt.title, pt.explanation, pt.content, pt.category]
      .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Zap className="w-7 h-7 text-brand-500" />
            Key Points
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            From: <span className="font-semibold text-brand-500">{activeDocument.filename}</span>
            {keyPoints.length > 0 && (
              <span className="ml-2 text-slate-400">{keyPoints.length} points extracted</span>
            )}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          <span>{keyPoints.length > 0 ? "Regenerate" : "Extract Key Points"}</span>
        </button>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-rose-500 font-semibold bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Extracting key concepts with Gemini AI...
          </p>
          <p className="text-xs text-slate-400">This may take a moment for longer documents</p>
        </div>
      )}

      {/* No key points yet */}
      {!loading && keyPoints.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 max-w-sm mx-auto">
          <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-full text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/30">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="font-display text-sm font-bold">No key points extracted yet</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Click <strong>"Extract Key Points"</strong> above. Gemini will analyze your document and surface the most important concepts, formulas, and exam-critical ideas — ranked by priority.
          </p>
          <div className="grid grid-cols-3 gap-3 w-full text-center">
            {[
              { icon: Star, label: "Prioritized", sub: "Critical → Low" },
              { icon: BookOpen, label: "Explained", sub: "With examples" },
              { icon: CheckCircle2, label: "Exam-ready", sub: "Memory tips" }
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 space-y-1">
                <Icon className="w-4 h-4 text-brand-500 mx-auto" />
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{label}</p>
                <p className="text-[9px] text-slate-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters + Key Points List */}
      {!loading && keyPoints.length > 0 && (
        <div className="space-y-4">
          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search key points..."
                className="w-full pl-3 pr-4 py-2 text-xs bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            {/* Priority filter */}
            <div className="flex flex-wrap gap-1.5">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize border transition-all ${
                    filter === p
                      ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                      : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-300"
                  }`}
                >
                  {p === "all" ? `All (${keyPoints.length})` : p}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Critical", count: keyPoints.filter(p => (p.priority||"").toLowerCase() === "critical").length, color: "text-rose-600 dark:text-rose-400" },
              { label: "High", count: keyPoints.filter(p => (p.priority||"").toLowerCase() === "high").length, color: "text-amber-600 dark:text-amber-400" },
              { label: "Medium", count: keyPoints.filter(p => (p.priority||"medium").toLowerCase() === "medium").length, color: "text-brand-600 dark:text-brand-400" },
              { label: "Low", count: keyPoints.filter(p => (p.priority||"").toLowerCase() === "low").length, color: "text-slate-600 dark:text-slate-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 text-center">
                <p className={`text-lg font-black ${color}`}>{count}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
              </div>
            ))}
          </div>

          {/* No search results */}
          {filteredPoints.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">
              No key points match your filter.
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredPoints.map((point, idx) => (
              <KeyPointCard key={idx} point={point} index={keyPoints.indexOf(point)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyPointsPage;
