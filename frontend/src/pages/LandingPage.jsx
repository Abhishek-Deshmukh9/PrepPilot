import React from "react";
import { Link } from "react-router-dom";
import LightPillar from "../components/effects/LightPillar";
import { Navigation2, UploadCloud, ChevronRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
    >
      {/* ── Full-screen LightPillar background ─────────────────── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <LightPillar
          topColor="#ff0417"
          bottomColor="#4abeef"
          intensity={1}
          rotationSpeed={0.5}
          glowAmount={0.002}
          pillarWidth={4}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* ── Vignette ────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── HUD top bar ─────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-20"
        style={{ borderBottom: "1px solid rgba(6,182,212,0.10)" }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)",
              boxShadow: "0 0 14px rgba(6,182,212,0.35)",
            }}
          >
            <Navigation2 className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="font-display font-bold tracking-widest uppercase text-lg"
            style={{ color: "#e2e8f0", letterSpacing: "0.1em" }}
          >
            PREP
            <span style={{ color: "#06b6d4", textShadow: "0 0 14px rgba(6,182,212,0.5)" }}>
              PILOT
            </span>
            <span
              className="ml-2 font-mono text-[9px] tracking-widest align-middle"
              style={{ color: "rgba(6,182,212,0.5)" }}
            >
              AI
            </span>
          </span>
        </div>

        {/* Status */}
        <div className="hidden sm:flex items-center space-x-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-hud-blink" />
          <span
            className="font-mono text-[9px] tracking-widest uppercase"
            style={{ color: "rgba(52,211,153,0.65)" }}
          >
            Systems Online
          </span>
        </div>
      </div>

      {/* ── Hero content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-7 px-6 max-w-3xl">
        {/* Badge */}
        <span
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-md font-mono text-[10px] tracking-widest uppercase"
          style={{
            background: "rgba(6,182,212,0.10)",
            border: "1px solid rgba(6,182,212,0.25)",
            color: "#22d3ee",
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-hud-blink"
          />
          <span>AI-Powered Study Platform</span>
        </span>

        {/* Main heading */}
        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "0.06em",
            color: "#e2e8f0",
            textShadow: "0 4px 40px rgba(6,182,212,0.2)",
          }}
        >
          PREP
          <span
            style={{
              color: "#06b6d4",
              textShadow: "0 0 40px rgba(6,182,212,0.6), 0 0 80px rgba(6,182,212,0.2)",
            }}
          >
            PILOT
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-base leading-relaxed max-w-xl"
          style={{ color: "rgba(148,163,184,0.8)" }}
        >
          Upload your study materials. Query, summarise, quiz yourself, and
          simulate interviews — all powered by retrieval-augmented AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)",
              color: "#fff",
              boxShadow:
                "0 0 30px rgba(6,182,212,0.40), 0 6px 20px rgba(0,0,0,0.5)",
              border: "1px solid rgba(6,182,212,0.5)",
              letterSpacing: "0.1em",
            }}
          >
            <span>Enter Dashboard</span>
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Link
            to="/upload"
            className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
            style={{
              background: "rgba(6,182,212,0.08)",
              color: "#22d3ee",
              border: "1px solid rgba(6,182,212,0.22)",
              letterSpacing: "0.1em",
            }}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Material</span>
          </Link>
        </div>

        {/* Feature strip */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
          {[
            "AI Tutor Chat",
            "Key Points",
            "Practice MCQs",
            "Flashcards",
            "Revision Sheets",
            "Interview Prep",
          ].map((f) => (
            <span
              key={f}
              className="font-mono text-[9px] tracking-widest uppercase"
              style={{ color: "rgba(6,182,212,0.40)" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom HUD glow rule ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.5) 40%, rgba(6,182,212,0.9) 50%, rgba(6,182,212,0.5) 60%, transparent 100%)",
        }}
      />

      {/* ── Corner decorations ───────────────────────────────────── */}
      {[
        { top: 80, left: 24, style: { borderTop: "1px solid rgba(6,182,212,0.35)", borderLeft: "1px solid rgba(6,182,212,0.35)" } },
        { top: 80, right: 24, style: { borderTop: "1px solid rgba(6,182,212,0.35)", borderRight: "1px solid rgba(6,182,212,0.35)" } },
        { bottom: 24, left: 24, style: { borderBottom: "1px solid rgba(6,182,212,0.35)", borderLeft: "1px solid rgba(6,182,212,0.35)" } },
        { bottom: 24, right: 24, style: { borderBottom: "1px solid rgba(6,182,212,0.35)", borderRight: "1px solid rgba(6,182,212,0.35)" } },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            ...c,
          }}
        />
      ))}
    </div>
  );
};

export default LandingPage;
