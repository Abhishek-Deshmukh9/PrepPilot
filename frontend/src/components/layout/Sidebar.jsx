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
  Zap,
  Lock,
} from "lucide-react";
import { useDocuments } from "../../contexts/DocumentContext";

const Sidebar = () => {
  const location = useLocation();
  const { activeDocument } = useDocuments();

  const navigation = [
    { name: "Dashboard",            path: "/",          icon: LayoutDashboard },
    { name: "AI Learning Companion",path: "/chat",      icon: MessageSquare   },
    { name: "Upload Documents",     path: "/upload",    icon: UploadCloud     },
    { name: "Summary Generator",    path: "/summary",   icon: FileDown,       requiresDoc: true },
    { name: "Key Points",           path: "/keypoints", icon: Zap,            requiresDoc: true },
    { name: "MCQ Practice",         path: "/mcqs",      icon: HelpCircle,     requiresDoc: true },
    { name: "Flashcards",           path: "/flashcards",icon: Copy,           requiresDoc: true },
    { name: "Interview Prep",       path: "/interview", icon: Briefcase       },
    { name: "Revision Sheets",      path: "/revision",  icon: FileText,       requiresDoc: true },
    { name: "Chat History",         path: "/history",   icon: History         },
  ];

  return (
    <aside
      className="w-64 h-[calc(100vh-3.5rem)] flex flex-col justify-between py-5 px-3.5 sticky top-14 z-20 shrink-0 select-none"
      style={{
        background: "rgba(10, 13, 20, 0.94)",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="space-y-5">

        {/* ── Active Study Guide Card ──────────────────────── */}
        <div
          className="relative rounded-2xl p-3.5 transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.18)",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] font-bold text-sky-400/80 tracking-widest uppercase mb-0.5">
                ACTIVE GUIDE
              </p>
              <h4
                className="font-display text-xs font-bold truncate text-slate-100 tracking-wide"
                title={activeDocument?.filename || "No document selected"}
              >
                {activeDocument?.filename || "No document selected"}
              </h4>
              {activeDocument && (
                <div
                  className="mt-2 pt-2 flex justify-between text-[10px] text-slate-400 font-mono"
                  style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
                >
                  <span className="uppercase tracking-wider text-sky-400/90 font-bold">{activeDocument.file_type}</span>
                  <span>{activeDocument.chunk_count || 0} chunks</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Navigation List ──────────────────────────────── */}
        <nav className="space-y-1">
          <p className="font-mono text-[9px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-2">
            STUDY MODULES
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isLocked = item.requiresDoc && !activeDocument;

            if (isLocked) {
              return (
                <div
                  key={item.name}
                  title="Select a document first to unlock"
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium cursor-not-allowed select-none opacity-40 text-slate-500"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  <Lock className="h-3 w-3 shrink-0 text-slate-600" />
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400 shadow-sm shadow-sky-500/5 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
                style={
                  isActive
                    ? {
                        border: "1px solid rgba(56, 189, 248, 0.2)",
                      }
                    : {
                        border: "1px solid transparent",
                      }
                }
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                    isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="tracking-wide truncate">{item.name}</span>

                {isActive && (
                  <span
                    className="absolute right-3 h-1.5 w-1.5 rounded-full bg-sky-400"
                    style={{
                      boxShadow: "0 0 8px rgba(56, 189, 248, 0.8)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Settings Link ──────────────────────────────────── */}
      <div
        className="pt-4"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <Link
          to="/settings"
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            location.pathname === "/settings"
              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <Settings
            className={`h-4 w-4 shrink-0 ${
              location.pathname === "/settings" ? "text-sky-400" : "text-slate-500"
            }`}
          />
          <span className="tracking-wide">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
