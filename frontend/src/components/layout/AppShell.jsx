import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppShell = ({ children }) => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 relative selection:bg-sky-500/30 selection:text-sky-100">
      {/* Subtle ambient mesh background */}
      <div className="mesh-bg pointer-events-none fixed inset-0 z-0" />

      {/* Subtle micro dot grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] px-5 py-6 sm:px-8 sm:py-8 animate-slide-up">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
