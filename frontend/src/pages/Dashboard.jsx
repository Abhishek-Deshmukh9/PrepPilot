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
  Zap
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";

const Dashboard = () => {
  const { documents, activeDocument, selectDocument } = useDocuments();

  const stats = [
    { name: "Total Knowledge Bases", value: documents.length, icon: FileText },
    { name: "Active Document", value: activeDocument ? "Active" : "None Selected", icon: BookOpen },
    { name: "Ready for Study", value: documents.filter(d => d.status === "ready").length, icon: Sparkles }
  ];

  const quickActions = [
    { 
      name: "AI Learning Companion", 
      desc: "Ask questions about your PDF — choose Socratic, ELI5, Exam Cram or Worked Example mode.", 
      path: "/chat", 
      icon: MessageSquare, 
      color: "from-brand-600 to-indigo-600",
      badge: "Core Feature",
      requiresDoc: false 
    },
    { 
      name: "Key Points Extractor", 
      desc: "Extract the most important concepts, formulas, and exam-critical ideas — ranked by priority.", 
      path: "/keypoints", 
      icon: Zap, 
      color: "from-amber-500 to-orange-500",
      badge: "New",
      requiresDoc: true 
    },
    { 
      name: "Document Summarizer", 
      desc: "Generate executive, detailed, and study guide summaries.", 
      path: "/summary", 
      icon: FileText, 
      color: "from-purple-500 to-pink-500",
      requiresDoc: true 
    },
    { 
      name: "Practice Quizzes", 
      desc: "Create multiple-choice practice exams with immediate scoring.", 
      path: "/mcqs", 
      icon: HelpCircle, 
      color: "from-emerald-500 to-teal-500",
      requiresDoc: true 
    },
    { 
      name: "Mock Interview Prep", 
      desc: "Scan resume against JDs to compile technical mock panels.", 
      path: "/interview", 
      icon: Briefcase, 
      color: "from-rose-500 to-pink-500",
      requiresDoc: false 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Welcome to PrepPilot AI</h1>
            <p className="text-brand-100 text-sm max-w-xl">
              Accelerate your preparation. Upload study materials to query notes, generate flashcards, practice quizzes, and simulate mock interviews.
            </p>
          </div>
          <Link
            to="/upload"
            className="self-start md:self-auto flex items-center space-x-2 bg-white text-brand-600 hover:bg-brand-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <UploadCloud className="h-4.5 w-4.5" />
            <span>Upload Knowledge Base</span>
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl flex items-center space-x-4 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
              <div className="bg-brand-50 dark:bg-brand-950/40 p-3 rounded-xl text-brand-600 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.name}</p>
                <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Active Study Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isLocked = action.requiresDoc && !activeDocument;
            
            const cardContent = (
              <div className={`p-6 rounded-2xl glass-card flex flex-col justify-between h-52 relative group overflow-hidden ${isLocked ? "opacity-55 cursor-not-allowed" : ""}`}>
                <div className="space-y-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-md font-bold group-hover:text-brand-500 transition-colors">{action.name}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">{action.desc}</p>
                </div>
                
                <div className="flex items-center text-xs font-semibold text-brand-500 mt-2">
                  <span>{isLocked ? "Unlock with Document" : "Open Module"}</span>
                  {!isLocked && <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />}
                </div>

                {isLocked && (
                  <span className="absolute right-4 top-4 text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">Locked</span>
                )}
              </div>
            );

            return isLocked ? (
              <div key={action.name} title="Select a document first to unlock this action.">{cardContent}</div>
            ) : (
              <Link key={action.name} to={action.path}>{cardContent}</Link>
            );
          })}
        </div>
      </div>

      {/* Quick Document Picker Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-lg font-bold">Knowledge Bases</h2>
          <Link to="/upload" className="text-xs text-brand-500 hover:underline font-semibold">Manage Documents</Link>
        </div>

        {documents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No documents uploaded yet. Go to <Link to="/upload" className="text-brand-500 hover:underline">Upload Page</Link> to import.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => {
                  const isActive = activeDocument?.id === doc.id;
                  return (
                    <tr 
                      key={doc.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors ${
                        isActive ? "bg-brand-50/20 dark:bg-brand-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 max-w-xs truncate">{doc.filename}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] text-slate-400 font-bold">{doc.file_type}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          doc.status === "ready" 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : doc.status === "processing"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {doc.status === "ready" && (
                          <button
                            onClick={() => selectDocument(isActive ? null : doc)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isActive
                                ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                : "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/10"
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
