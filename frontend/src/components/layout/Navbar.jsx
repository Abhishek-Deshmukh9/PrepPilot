import React from "react";
import { Link } from "react-router-dom";
import { Compass, BookOpen, ChevronDown, Sparkles } from "lucide-react";
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
      className="h-14 flex items-center justify-between px-5 sm:px-6 sticky top-0 z-30 transition-all"
      style={{
        background: "rgba(7, 9, 14, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {/* ── Brand Logo ──────────────────────────────────────── */}
      <Link to="/" className="flex items-center space-x-3 group shrink-0">
        <div
          className="relative flex items-center justify-center h-8 w-8 rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
            boxShadow: "0 0 16px rgba(14,165,233,0.35), 0 0 1px rgba(255,255,255,0.5) inset",
          }}
        >
          <Compass className="h-4 w-4 text-white" strokeWidth={2.4} />
        </div>

        <div className="leading-none flex items-baseline space-x-1">
          <span
            className="font-display text-[21px] font-extrabold tracking-wider uppercase"
            style={{
              background: "linear-gradient(90deg, #f8fafc 30%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.06em",
            }}
          >
            PREP
          </span>
          <span
            className="font-display text-[21px] font-extrabold tracking-wider uppercase text-sky-400"
            style={{
              letterSpacing: "0.06em",
              textShadow: "0 0 14px rgba(56,189,248,0.45)",
            }}
          >
            PILOT
          </span>
          <span className="font-mono text-[9px] font-bold tracking-widest text-sky-400/70 ml-1.5 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/20">
            AI
          </span>
        </div>
      </Link>

      {/* ── Center: Active Document Switcher ───────────────── */}
      <div className="flex items-center space-x-3">
        <div
          className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs transition-all"
          style={{
            background: "rgba(18, 24, 36, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-sky-400" />
          <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase">GUIDE:</span>
          <div className="relative flex items-center">
            <select
              value={activeDocument?.id || ""}
              onChange={handleDocChange}
              className="bg-transparent font-sans text-xs font-semibold text-slate-200 pr-5 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#0c1017]">Select document…</option>
              {documents.filter((d) => d.status === "ready").map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-[#0c1017]">
                  {doc.filename.length > 28 ? `${doc.filename.substring(0, 28)}…` : doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-0 pointer-events-none text-slate-500" />
          </div>
        </div>
      </div>

      {/* ── Right: Telemetry Status ─────────────────────────── */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* System status pill */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
          <span className="font-mono text-[9px] font-bold text-emerald-400/90 tracking-widest uppercase">SYS READY</span>
        </div>

        {/* User / Tutor Badge */}
        <div
          className="flex items-center space-x-2.5 pl-3"
          style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <div
            className="h-7 w-7 rounded-xl flex items-center justify-center font-display text-[11px] font-bold tracking-widest text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #4338ca 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-200" />
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-[11px] font-semibold text-slate-200 tracking-wide">Study Space</p>
            <p className="font-mono text-[9px] text-sky-400/70 tracking-wider">TUTOR ONLINE</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
