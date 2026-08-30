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
    { name: "Dashboard",            path: "/dashboard", icon: LayoutDashboard },
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
      className="w-60 h-[calc(100vh-3.5rem)] flex flex-col justify-between py-4 px-3 sticky top-14 z-20"
      style={{
        background: "rgba(5, 9, 15, 0.92)",
        borderRight: "1px solid rgba(6, 182, 212, 0.10)",
      }}
    >
      <div className="space-y-5">

        {/* ── Active document panel ─────────────────────────── */}
        <div
          className="relative rounded-xl px-4 py-3 hud-corner"
          style={{
            background: "rgba(14, 116, 144, 0.12)",
            border: "1px solid rgba(6, 182, 212, 0.20)",
          }}
        >
          {/* Corner brackets are painted by .hud-corner CSS */}
          <div className="flex items-start space-x-2.5">
            <BookOpen className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#06b6d4" }} />
            <div className="min-w-0 flex-1">
              <p className="hud-label mb-1">Active Study Guide</p>
              <h4
                className="font-display text-sm font-semibold truncate text-slate-100 tracking-wide"
                title={activeDocument?.filename || "No document selected"}
              >
                {activeDocument?.filename || "No document selected"}
              </h4>
              {activeDocument && (
                <div
                  className="mt-2 pt-2 flex justify-between text-[10px]"
                  style={{ borderTop: "1px solid rgba(6,182,212,0.12)", color: "rgba(6,182,212,0.55)" }}
                >
                  <span className="font-mono uppercase tracking-widest">{activeDocument.file_type}</span>
                  <span className="font-mono">{activeDocument.chunk_count || 0} chunks</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────── */}
        <nav className="space-y-0.5">
          {/* Section label */}
          <p className="hud-label px-3 mb-2" style={{ color: "rgba(6,182,212,0.35)" }}>Navigation</p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isLocked = item.requiresDoc && !activeDocument;

            if (isLocked) {
              return (
                <div
                  key={item.name}
                  title="Select a document first"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium cursor-not-allowed select-none"
                  style={{ color: "rgba(100,116,139,0.45)" }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  <Lock className="h-2.5 w-2.5 shrink-0" style={{ color: "rgba(100,116,139,0.3)" }} />
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group relative"
                style={
                  isActive
                    ? {
                        background: "rgba(6,182,212,0.10)",
                        color: "#22d3ee",
                        borderLeft: "2px solid #06b6d4",
                        paddingLeft: "10px",
                      }
                    : {
                        color: "rgba(148,163,184,0.8)",
                        borderLeft: "2px solid transparent",
                      }
                }
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 transition-colors duration-150"
                  style={{ color: isActive ? "#06b6d4" : "rgba(100,116,139,0.7)" }}
                />
                <span className="tracking-wide">{item.name}</span>

                {/* Active indicator pip */}
                {isActive && (
                  <span
                    className="absolute right-3 h-1 w-1 rounded-full"
                    style={{
                      background: "#06b6d4",
                      boxShadow: "0 0 6px rgba(6,182,212,0.8)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Footer / Settings ────────────────────────────────── */}
      <div
        className="pt-4"
        style={{ borderTop: "1px solid rgba(6,182,212,0.08)" }}
      >
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={
            location.pathname === "/settings"
              ? {
                  background: "rgba(6,182,212,0.10)",
                  color: "#22d3ee",
                  borderLeft: "2px solid #06b6d4",
                  paddingLeft: "10px",
                }
              : { color: "rgba(148,163,184,0.6)", borderLeft: "2px solid transparent" }
          }
        >
          <Settings
            className="h-3.5 w-3.5 shrink-0"
            style={{
              color:
                location.pathname === "/settings"
                  ? "#06b6d4"
                  : "rgba(100,116,139,0.6)",
            }}
          />
          <span className="tracking-wide">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
