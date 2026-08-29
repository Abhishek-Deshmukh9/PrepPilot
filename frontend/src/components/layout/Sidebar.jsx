import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UploadCloud, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  Copy, 
  Briefcase, 
  History, 
  Settings,
  BookOpen,
  FileDown,
  Zap
} from "lucide-react";
import { useDocuments } from "../../contexts/DocumentContext";

const Sidebar = () => {
  const location = useLocation();
  const { activeDocument } = useDocuments();

  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "AI Learning Companion", path: "/chat", icon: MessageSquare, requiresDoc: false },
    { name: "Upload Documents", path: "/upload", icon: UploadCloud },
    { name: "Summary Generator", path: "/summary", icon: FileDown, requiresDoc: true },
    { name: "Key Points", path: "/keypoints", icon: Zap, requiresDoc: true },
    { name: "MCQ Practice", path: "/mcqs", icon: HelpCircle, requiresDoc: true },
    { name: "Flashcards", path: "/flashcards", icon: Copy, requiresDoc: true },
    { name: "Interview Prep", path: "/interview", icon: Briefcase },
    { name: "Revision Sheets", path: "/revision", icon: FileText, requiresDoc: true },
    { name: "Chat History", path: "/history", icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-xl h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sticky top-16 z-20 transition-all duration-300">
      <div className="space-y-6">
        {/* Active Study Document Display */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20 dark:shadow-brand-900/30 transition-all duration-300 animate-pulse-subtle">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-brand-100 font-display">Active Study Guide</p>
              <h4 className="text-sm font-semibold truncate mt-0.5" title={activeDocument?.filename || "No document selected"}>
                {activeDocument?.filename || "Select a Document"}
              </h4>
            </div>
          </div>
          {activeDocument && (
            <div className="mt-2.5 pt-2.5 border-t border-white/20 flex justify-between items-center text-[11px] text-brand-100">
              <span className="capitalize">{activeDocument.file_type} format</span>
              <span>{activeDocument.chunk_count || 0} chunks</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isLocked = item.requiresDoc && !activeDocument;
            
            return (
              <div key={item.name}>
                {isLocked ? (
                  <div 
                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed group relative"
                    title="Select a document first to unlock this study tool"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                    <span className="absolute right-3.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 px-1.5 py-0.5 rounded-md">Locked</span>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-semibold"
                        : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-brand-500" : "text-slate-400 group-hover:text-slate-500"}`} />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings Link */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/settings"
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
            location.pathname === "/settings"
              ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-semibold"
              : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100"
          }`}
        >
          <Settings className="h-4 w-4 shrink-0 text-slate-400" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
