import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Dynamic Background Mesh Overlay */}
      <div className="mesh-bg" />
      
      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Navigation */}
        <Sidebar />

        {/* Right Scrollable Content Pane */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] p-6 md:p-8 animate-slide-up relative">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
