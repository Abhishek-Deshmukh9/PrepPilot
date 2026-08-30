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
  Check,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";
import { MathRenderer } from "../components/common/MathRenderer";

// ─── Priority Badge ──────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const styles = {
    critical: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    medium: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    low: "bg-slate-500/10 text-slate-400 border-slate-500/30"
  };
  const icons = { critical: "🔴", high: "🟡", medium: "🔵", low: "⚪" };
  const p = (priority || "medium").toLowerCase();
  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${styles[p] || styles.medium}`}>
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
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-200 hover:border-sky-500/30">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-white/[0.04]">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-sky-500/20">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-slate-100 leading-tight">
                {point.concept || point.title || `Key Concept ${index + 1}`}
              </h3>
              {point.priority && <PriorityBadge priority={point.priority} />}
              {point.category && (
                <span className="px-2 py-0.5 bg-white/[0.04] text-slate-400 rounded-full font-mono text-[9px] font-semibold border border-white/[0.06]">
                  {point.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy key point"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-3">
          {/* Main explanation */}
          {(point.explanation || point.content) && (
            <div className="text-xs text-slate-300 leading-relaxed bg-black/20 rounded-xl p-3.5 border border-white/[0.04]">
              <MathRenderer text={point.explanation || point.content} />
            </div>
          )}

          {/* Example if available */}
          {point.example && (
            <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">PRACTICAL EXAMPLE</p>
              <div className="text-slate-200">
                <MathRenderer text={point.example} />
              </div>
            </div>
          )}

          {/* Formula if available */}
          {point.formula && (
            <div className="text-xs bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 space-y-1">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-400">MATHEMATICAL NOTATION / FORMULA</p>
              <div className="text-slate-200 font-mono">
                <MathRenderer text={point.formula} />
              </div>
            </div>
          )}

          {/* Memory tip if available */}
          {point.memory_tip && (
            <div className="text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-400">💡 MEMORY RETENTION TIP</p>
              <p className="text-amber-200/90">{point.memory_tip}</p>
            </div>
          )}

          {/* Tags */}
          {point.tags && point.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {point.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white/[0.04] text-slate-400 rounded-full font-mono text-[9px] font-semibold border border-white/[0.06]"
                >
                  <Hash className="w-2.5 h-2.5 text-sky-400" />
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

  const transformKeyPoints = (rawKeypoints) => {
    const cards = [];
    rawKeypoints.forEach((group) => {
      const priority = categoryPriorityMap[group.category] || "medium";
      (group.points || []).forEach((point) => {
        cards.push({
          category: group.category,
          concept: point,
          explanation: null,
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
      const rawKeypoints = result.keypoints || result.key_points || [];
      const cards = transformKeyPoints(rawKeypoints);
      setKeyPoints(cards);
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate key points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setKeyPoints([]);
    setErrorMsg("");
    setFilter("all");
    setSearchQuery("");
  }, [activeDocument]);

  if (!activeDocument) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 animate-slide-up">
        <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
          <Zap className="h-8 w-8 animate-pulse-subtle" />
        </div>
        <h3 className="font-display text-base font-bold text-slate-100">Select Study Document</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pick a document from the top navigation. PrepPilot extracts the high-yield concepts, formulas, and critical insights into prioritized study cards.
        </p>
      </div>
    );
  }

  const priorities = ["all", "critical", "high", "medium", "low"];
  const filteredPoints = keyPoints.filter((pt) => {
    const matchesPriority = filter === "all" || (pt.priority || "medium").toLowerCase() === filter;
    const matchesSearch = !searchQuery || [pt.concept, pt.title, pt.explanation, pt.content, pt.category]
      .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-slate-100">
            <Zap className="w-7 h-7 text-amber-400" />
            <span>Key Points Extractor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing: <span className="font-semibold text-sky-400">{activeDocument.filename}</span>
            {keyPoints.length > 0 && (
              <span className="ml-2 font-mono text-slate-500">({keyPoints.length} points extracted)</span>
            )}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
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
        <div className="flex items-center space-x-2 text-xs text-rose-400 font-semibold bg-rose-500/10 px-4 py-3 rounded-2xl border border-rose-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 glass-panel rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sm font-semibold text-slate-200">
            Synthesizing core concepts with Gemini AI...
          </p>
          <p className="text-xs text-slate-400">Rank-ordering formulas and high-yield items</p>
        </div>
      )}

      {/* No key points yet */}
      {!loading && keyPoints.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 space-y-5 max-w-md mx-auto glass-panel rounded-3xl p-8">
          <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
            <Target className="h-8 w-8 animate-pulse-subtle" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-base font-bold text-slate-100">No key points extracted yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong>"Extract Key Points"</strong> above. Gemini will parse your document and compile prioritized concept cards with memory retention aids.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full text-center pt-2">
            {[
              { icon: Star, label: "Prioritized", sub: "Critical → Low" },
              { icon: BookOpen, label: "Structured", sub: "With examples" },
              { icon: CheckCircle2, label: "Exam-Ready", sub: "Formulas & Tips" }
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-1">
                <Icon className="w-4 h-4 text-sky-400 mx-auto" />
                <p className="text-[11px] font-bold text-slate-200">{label}</p>
                <p className="font-mono text-[9px] text-slate-500">{sub}</p>
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
                placeholder="Search concepts, formulas, definitions..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] focus:border-sky-500/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
            {/* Priority filter */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:inline" />
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize font-mono border transition-all ${
                    filter === p
                      ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                      : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:border-white/20 hover:text-slate-200"
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
              { label: "Critical", count: keyPoints.filter(p => (p.priority||"").toLowerCase() === "critical").length, color: "text-rose-400" },
              { label: "High", count: keyPoints.filter(p => (p.priority||"").toLowerCase() === "high").length, color: "text-amber-400" },
              { label: "Medium", count: keyPoints.filter(p => (p.priority||"medium").toLowerCase() === "medium").length, color: "text-sky-400" },
              { label: "Low", count: keyPoints.filter(p => (p.priority||"").toLowerCase() === "low").length, color: "text-slate-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="glass-card rounded-2xl p-3 text-center">
                <p className={`font-display text-xl font-bold ${color}`}>{count}</p>
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* No search results */}
          {filteredPoints.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-400 glass-panel rounded-2xl">
              No key points match your filter criteria.
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
