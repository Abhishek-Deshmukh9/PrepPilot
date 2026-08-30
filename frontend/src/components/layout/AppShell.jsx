import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppShell = ({ children }) => {
  // Cockpit theme is always dark — force the class on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
