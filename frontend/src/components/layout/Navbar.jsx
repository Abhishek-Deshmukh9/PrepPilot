import React from "react";
import { Link } from "react-router-dom";
import { Navigation2, BookOpen, ChevronDown } from "lucide-react";
import { useDocuments } from "../../contexts/DocumentContext";

const Navbar = () => {
  const { documents, activeDocument, selectDocument } = useDocuments();

  const handleDocChange = (e) => {
    const docId = e.target.value;
    if (!docId) { selectDocument(null); return; }
    const doc = documents.find((d) => d.id === docId);
    if (doc) selectDocument(doc);
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-30"
      style={{
        background: "rgba(5, 9, 15, 0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(6, 182, 212, 0.15)",
        boxShadow: "0 1px 0 rgba(6,182,212,0.06), 0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Brand ──────────────────────────────────────────── */}
      <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
        {/* HUD icon */}
        <div
          className="relative flex items-center justify-center h-8 w-8 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)",
            boxShadow: "0 0 14px rgba(6,182,212,0.35), 0 0 1px rgba(6,182,212,0.6) inset",
          }}
        >
          <Navigation2 className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>

        {/* Wordmark */}
        <div className="leading-none">
          <span
            className="font-display text-[22px] font-bold tracking-wider uppercase"
            style={{
              background: "linear-gradient(90deg, #e2e8f0 30%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.06em",
            }}
          >
            PREP
          </span>
          <span
            className="font-display text-[22px] font-bold tracking-wider uppercase"
            style={{
              color: "#06b6d4",
              letterSpacing: "0.06em",
              textShadow: "0 0 12px rgba(6,182,212,0.5)",
            }}
          >
            PILOT
          </span>
          <span className="hud-label ml-2 align-middle">AI</span>
        </div>
      </Link>

      {/* ── Center: Active document selector ───────────────── */}
      <div className="flex items-center space-x-3">
        <div
          className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg text-xs"
          style={{
            background: "rgba(15, 25, 41, 0.8)",
            border: "1px solid rgba(6, 182, 212, 0.14)",
          }}
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0" style={{ color: "#06b6d4" }} />
          <span className="hud-label" style={{ color: "rgba(6,182,212,0.55)" }}>MISSION</span>
          <div className="relative flex items-center">
            <select
              value={activeDocument?.id || ""}
              onChange={handleDocChange}
              className="bg-transparent font-sans text-xs font-semibold text-slate-300 pr-5 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#0a1020]">Select document…</option>
              {documents.filter((d) => d.status === "ready").map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-[#0a1020]">
                  {doc.filename.length > 28 ? `${doc.filename.substring(0, 28)}…` : doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-0 pointer-events-none text-slate-500" />
          </div>
        </div>
      </div>

      {/* ── Right: Status cluster ───────────────────────────── */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* System status indicator */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-hud-blink" />
          <span className="hud-label" style={{ color: "rgba(52,211,153,0.7)" }}>SYS ONLINE</span>
        </div>

        {/* Pilot badge */}
        <div
          className="flex items-center space-x-2.5 pl-4"
          style={{ borderLeft: "1px solid rgba(6,182,212,0.12)" }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center font-display text-[11px] font-bold tracking-widest text-white"
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
              border: "1px solid rgba(6,182,212,0.25)",
              boxShadow: "0 0 10px rgba(6,182,212,0.15)",
              letterSpacing: "0.08em",
            }}
          >
            PA
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-[11px] font-semibold text-slate-200 tracking-wide">Pilot Assistant</p>
            <p className="hud-label" style={{ color: "rgba(6,182,212,0.55)" }}>Study Mode Active</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
