import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useDocuments } from "../../contexts/DocumentContext";
import { AlertTriangle, Loader2 } from "lucide-react";

const AppShell = ({ children }) => {
  const { activeDocument } = useDocuments();

  // Cockpit theme is always dark — force the class on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const isProcessing = activeDocument?.status === "processing";
  const isError = activeDocument?.status === "error";

  return (
    <div className="min-h-screen flex flex-col bg-[#05090f] text-slate-200 relative cockpit-scan">
      {/* Ambient radial glow */}
      <div className="mesh-bg pointer-events-none" />

      {/* Fine cockpit dot-grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(6,182,212,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Navigation */}
        <Sidebar />

        {/* Main content pane */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] px-6 py-6 md:px-8 md:py-7 animate-slide-up">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">

            {/* Processing warning banner */}
            {isProcessing && (
              <div className="flex items-center space-x-2.5 px-4 py-2.5 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-300 backdrop-blur-sm">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-400" />
                <span>
                  <span className="font-bold">"{activeDocument.filename}"</span> is still being processed. Study tools may have limited results until processing completes.
                </span>
              </div>
            )}

            {/* Error warning banner */}
            {isError && (
              <div className="flex items-center space-x-2.5 px-4 py-2.5 bg-rose-950/30 border border-rose-500/20 rounded-xl text-xs text-rose-300 backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  <span className="font-bold">"{activeDocument.filename}"</span> failed to process. Please re-upload or select a different document.
                </span>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
