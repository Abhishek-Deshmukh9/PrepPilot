import React from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  Briefcase, 
  UploadCloud, 
  ChevronRight,
  BookOpen,
  Copy,
  Zap,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";

const Dashboard = () => {
  const { documents, activeDocument, selectDocument } = useDocuments();

  const stats = [
    { name: "Total Knowledge Bases", value: documents.length, icon: FileText, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
    { name: "Active Document", value: activeDocument ? activeDocument.filename : "None Selected", icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { name: "Ready for Study", value: documents.filter(d => d.status === "ready").length, icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
  ];

  const quickActions = [
    { 
      name: "AI Learning Companion", 
      desc: "Ask any academic question with Socratic, ELI5, Exam Cram, and Worked Example modes.", 
      path: "/chat", 
      icon: MessageSquare, 
      color: "from-sky-500 to-indigo-600",
      accent: "text-sky-400",
      badge: "Core Feature",
      requiresDoc: false 
    },
    { 
      name: "Key Points Extractor", 
      desc: "Extract core concepts, formulas, and high-yield notes categorized by priority ranking.", 
      path: "/keypoints", 
      icon: Zap, 
      color: "from-amber-500 to-orange-600",
      accent: "text-amber-400",
      badge: "New",
      requiresDoc: true 
    },
    { 
      name: "Document Summarizer", 
      desc: "Generate executive overviews, detailed structures, and rapid revision summaries.", 
      path: "/summary", 
      icon: FileText, 
      color: "from-purple-500 to-pink-600",
      accent: "text-purple-400",
      requiresDoc: true 
    },
    { 
      name: "Practice Quizzes", 
      desc: "Test active recall with custom multiple-choice exams and instant conceptual feedback.", 
      path: "/mcqs", 
      icon: HelpCircle, 
      color: "from-emerald-500 to-teal-600",
      accent: "text-emerald-400",
      requiresDoc: true 
    },
    { 
      name: "Flashcard Decks", 
      desc: "Study terminology cards with interactive 3D flips and spaced repetition memory ratings.", 
      path: "/flashcards", 
      icon: Copy, 
      color: "from-blue-500 to-cyan-600",
      accent: "text-blue-400",
      requiresDoc: true 
    },
    { 
      name: "Revision Cheat Sheets", 
      desc: "Generate last-minute study notes, formula cheat sheets, and high-yield exam Q&As.", 
      path: "/revision", 
      icon: FileText, 
      color: "from-violet-500 to-indigo-600",
      accent: "text-violet-400",
      requiresDoc: true 
    },
    { 
      name: "Mock Interview Prep", 
      desc: "Scan your resume against job descriptions to generate technical & behavioral mock panels.", 
      path: "/interview", 
      icon: Briefcase, 
      color: "from-rose-500 to-pink-600",
      accent: "text-rose-400",
      requiresDoc: false 
    }
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Welcome Flight Deck Banner ─────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-2xl transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[10px] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse-subtle" />
              <span>ACADEMIC COPILOT ONLINE</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
              Welcome to PrepPilot
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Accelerate your learning workflow. Upload lecture notes, academic PDFs, or study guides to extract key concepts, practice quizzes, and master any subject with an adaptive AI tutor.
            </p>
          </div>
          <Link
            to="/upload"
            className="self-start md:self-auto flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Study Guide</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
          </Link>
        </div>
        
        {/* Subtle decorative glow orb */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Telemetry Overview Stats ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl flex items-center space-x-4 transition-all hover:border-sky-500/25"
            >
              <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.name}</p>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100 mt-0.5 truncate" title={String(stat.value)}>
                  {stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Study Modules Grid ──────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-100">
            Study Modules
          </h2>
          <span className="font-mono text-[10px] text-slate-400">
            {activeDocument ? `ACTIVE: ${activeDocument.filename}` : "Select a document to unlock all modules"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isLocked = action.requiresDoc && !activeDocument;
            
            const cardContent = (
              <div
                className={`p-6 rounded-2xl glass-card flex flex-col justify-between h-56 relative group overflow-hidden ${
                  isLocked ? "opacity-45 cursor-not-allowed" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-md shadow-black/40`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {action.badge && (
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs font-semibold text-sky-400">
                  <span>{isLocked ? "Requires Document" : "Launch Module"}</span>
                  {!isLocked ? (
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </div>
              </div>
            );

            return isLocked ? (
              <div key={action.name} title="Select a study document first to unlock this tool.">{cardContent}</div>
            ) : (
              <Link key={action.name} to={action.path}>{cardContent}</Link>
            );
          })}
        </div>
      </div>

      {/* ── Uploaded Knowledge Bases Table ─────────────────── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">Study Knowledge Bases</h2>
            <p className="text-xs text-slate-400">Manage and switch between uploaded academic documents</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 font-mono text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>MANAGE ALL</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-3">
            <p>No knowledge bases uploaded yet.</p>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-4 py-2 rounded-xl font-semibold transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload your first document</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 uppercase tracking-widest font-mono text-[9px]">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {documents.map((doc) => {
                  const isActive = activeDocument?.id === doc.id;
                  return (
                    <tr 
                      key={doc.id} 
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isActive ? "bg-sky-500/[0.08]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-xs truncate flex items-center space-x-2.5">
                        <FileText className="h-4 w-4 text-sky-400/80 shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 uppercase font-bold">{doc.file_type}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{doc.chunk_count || 0}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                          doc.status === "ready" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : doc.status === "processing"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {doc.status === "ready" && (
                          <button
                            onClick={() => selectDocument(isActive ? null : doc)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                              isActive
                                ? "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                                : "bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20"
                            }`}
                          >
                            {isActive ? "Deselect" : "Study Now"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
