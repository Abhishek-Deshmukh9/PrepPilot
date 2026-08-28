import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  FileCheck, 
  HelpCircle, 
  AlertCircle, 
  Layers, 
  Search,
  BrainCircuit,
  Pin
} from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "./WhyRecommendationBadge";

export const SmartNotesPanel = ({
  notesData = null,
  activeTopic = "Binary Search Complexity",
  onGenerateFlashcards = null,
  className = ""
}) => {
  // Categorized Smart Notes state
  const [formulas, setFormulas] = useState([
    { id: "f1", text: "Recurrence Relation: $T(n) = T(n/2) + \\mathcal{O}(1)$", pinned: true },
    { id: "f2", text: "Base Termination: $2^k = n \\iff k = \\log_2 n$", pinned: true },
    { id: "f3", text: "Worst-Case Time: $\\mathcal{O}(\\log_2 n)$", pinned: true },
    { id: "f4", text: "Auxiliary Space: $\\mathcal{O}(1)$ iterative / $\\mathcal{O}(\\log_2 n)$ recursive call stack", pinned: false }
  ]);

  const [prerequisites, setPrerequisites] = useState([
    { id: "p1", title: "Logarithms as Repeated Halving", desc: "Understanding that $\\log_2 n$ is the number of times you can divide $n$ by $2$ until reaching $1$." },
    { id: "p2", title: "Monotonic Array Order", desc: "Binary search requires array elements to be strictly sorted ($A[i] \\le A[i+1]$)." }
  ]);

  const [keyTakeaways, setKeyTakeaways] = useState([
    { id: "k1", text: "Eliminates half the search space at each iteration." },
    { id: "k2", text: "For $n = 1,000,000$, binary search takes at most $20$ comparisons, compared to $1,000,000$ for linear search." }
  ]);

  const [pitfalls, setPitfalls] = useState([
    { id: "e1", text: "Integer Overflow: Use $mid = left + \\lfloor (right - left) / 2 \\rfloor$ instead of $(left + right) / 2$ in languages with bounded integer types." },
    { id: "e2", text: "Off-by-one errors: Setting $right = mid$ instead of $mid - 1$ can cause infinite loops." }
  ]);

  const [customNote, setCustomNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'formulas' | 'prereqs' | 'pitfalls'

  // Update notes whenever AI sends smart_notes update
  useEffect(() => {
    if (notesData) {
      if (notesData.formulas && Array.isArray(notesData.formulas)) {
        setFormulas(prev => [
          ...notesData.formulas.map((f, i) => ({ id: `f_dyn_${Date.now()}_${i}`, text: f, pinned: true })),
          ...prev.filter(p => !notesData.formulas.includes(p.text))
        ]);
      }

      if (notesData.prerequisites && Array.isArray(notesData.prerequisites)) {
        setPrerequisites(prev => [
          ...notesData.prerequisites.map((p, i) => typeof p === "string" ? { id: `p_dyn_${i}`, title: p, desc: "" } : { id: `p_dyn_${i}`, ...p }),
          ...prev
        ]);
      }

      if (notesData.key_takeaways && Array.isArray(notesData.key_takeaways)) {
        setKeyTakeaways(prev => [
          ...notesData.key_takeaways.map((k, i) => ({ id: `k_dyn_${i}`, text: k })),
          ...prev
        ]);
      }

      if (notesData.pitfalls && Array.isArray(notesData.pitfalls)) {
        setPitfalls(prev => [
          ...notesData.pitfalls.map((p, i) => ({ id: `e_dyn_${i}`, text: p })),
          ...prev
        ]);
      }
    }
  }, [notesData]);

  const handleAddCustomNote = (e) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    setKeyTakeaways(prev => [{ id: `k_user_${Date.now()}`, text: customNote.trim() }, ...prev]);
    setCustomNote("");
  };

  const handleCopyNotes = () => {
    let md = `# Smart Notes: ${activeTopic}\n\n`;
    md += `## Key Formulas (LaTeX)\n`;
    formulas.forEach(f => md += `- ${f.text}\n`);
    md += `\n## Prerequisites & Fundamentals\n`;
    prerequisites.forEach(p => md += `- **${p.title}**: ${p.desc}\n`);
    md += `\n## Core Takeaways\n`;
    keyTakeaways.forEach(k => md += `- ${k.text}\n`);
    md += `\n## Common Pitfalls & Exam Traps\n`;
    pitfalls.forEach(p => md += `- ${p.text}\n`);

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden backdrop-blur-xl ${className}`}>
      {/* Header */}
      <div className="p-4 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Live Smart Notes</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Syncing" />
            </h3>
            <p className="text-[10px] text-slate-400">
              Auto-syncs takeaways, LaTeX formulas & prerequisites
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopyNotes}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs transition-colors flex items-center space-x-1"
            title="Copy Smart Notes as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-medium hidden sm:inline">{copied ? "Copied" : "Export"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-1 overflow-x-auto text-[11px] font-semibold">
        {["all", "formulas", "prereqs", "pitfalls"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
              activeTab === tab 
                ? "bg-brand-600 text-white shadow-xs" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            {tab === "prereqs" ? "Prerequisites" : tab}
          </button>
        ))}
      </div>

      {/* Main Notes List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* SECTION: Formulas */}
        {(activeTab === "all" || activeTab === "formulas") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-500" />
                <span>Key Formulas (LaTeX)</span>
              </span>
              <WhyRecommendationBadge
                type="topic"
                customReason="Recommended because these formulas appear on 80%+ of exams for this topic."
                variant="icon"
              />
            </div>
            <div className="space-y-1.5">
              {formulas.map((formula) => (
                <div 
                  key={formula.id}
                  className="p-2.5 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 rounded-xl text-xs text-slate-800 dark:text-slate-100 flex items-start justify-between gap-2 shadow-2xs"
                >
                  <MathRenderer text={formula.text} />
                  {formula.pinned && <Pin className="w-3 h-3 text-brand-500 shrink-0 mt-1 opacity-70" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Prerequisites */}
        {(activeTab === "all" || activeTab === "prereqs") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-violet-500" />
                <span>Prerequisites & Mental Models</span>
              </span>
              <WhyRecommendationBadge
                type="prerequisite"
                customReason="Recommended because this is a prerequisite for the topic you're currently studying."
                variant="icon"
              />
            </div>
            <div className="space-y-1.5">
              {prerequisites.map((prereq) => (
                <div 
                  key={prereq.id}
                  className="p-2.5 bg-violet-50/40 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40 rounded-xl text-xs space-y-0.5 shadow-2xs"
                >
                  <div className="font-bold text-violet-900 dark:text-violet-200">
                    <MathRenderer text={prereq.title} />
                  </div>
                  {prereq.desc && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      <MathRenderer text={prereq.desc} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Key Takeaways */}
        {(activeTab === "all") && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-500" />
              <span>Core Takeaways</span>
            </span>
            <div className="space-y-1.5">
              {keyTakeaways.map((takeaway) => (
                <div 
                  key={takeaway.id}
                  className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-2xs"
                >
                  <MathRenderer text={takeaway.text} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Common Pitfalls */}
        {(activeTab === "all" || activeTab === "pitfalls") && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              <span>Common Pitfalls & Exam Traps</span>
            </span>
            <div className="space-y-1.5">
              {pitfalls.map((pitfall) => (
                <div 
                  key={pitfall.id}
                  className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-2xs"
                >
                  <MathRenderer text={pitfall.text} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add Custom Note Input */}
      <form onSubmit={handleAddCustomNote} className="p-3 bg-white/90 dark:bg-slate-950/90 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-2">
        <input
          type="text"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Add custom note ($LaTeX$ supported)..."
          className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={!customNote.trim()}
          className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          title="Add Note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SmartNotesPanel;
