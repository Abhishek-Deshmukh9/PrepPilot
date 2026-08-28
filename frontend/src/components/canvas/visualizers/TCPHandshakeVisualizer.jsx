import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  ShieldCheck, 
  Server, 
  Laptop, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Info,
  Clock
} from "lucide-react";
import { MathRenderer } from "../../common/MathRenderer";

export const TCPHandshakeVisualizer = ({
  onComponentClick = null
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0: initial, 1: SYN, 2: SYN-ACK, 3: ACK, 4: ESTABLISHED
  const [isPlaying, setIsPlaying] = useState(false);
  const [seqX, setSeqX] = useState(100);
  const [seqY, setSeqY] = useState(300);

  const stepsData = [
    {
      step: 0,
      title: "Initial State (Pre-Connection)",
      clientState: "CLOSED",
      serverState: "LISTEN",
      sender: "None",
      packet: null,
      desc: "Client is in CLOSED state wanting to connect. Server is in LISTEN state on a designated port (e.g. 443/80)."
    },
    {
      step: 1,
      title: "Step 1: Client sends SYN (Synchronize Sequence Number)",
      clientState: "SYN_SENT",
      serverState: "LISTEN",
      sender: "Client → Server",
      packet: {
        type: "SYN",
        flags: "SYN = 1, ACK = 0",
        seq: `seq = ${seqX}`,
        ack: "ack = 0",
        latex: "\\text{SYN} \\quad [\\text{seq} = x = " + seqX + "]"
      },
      desc: "Client selects an Initial Sequence Number (ISN) $x$ and transmits a segment with the SYN control flag set to $1$."
    },
    {
      step: 2,
      title: "Step 2: Server responds with SYN-ACK",
      clientState: "SYN_SENT",
      serverState: "SYN_RCVD",
      sender: "Server → Client",
      packet: {
        type: "SYN-ACK",
        flags: "SYN = 1, ACK = 1",
        seq: `seq = ${seqY}`,
        ack: `ack = ${seqX + 1}`,
        latex: "\\text{SYN-ACK} \\quad [\\text{seq} = y = " + seqY + ",\\, \\text{ack} = x + 1 = " + (seqX + 1) + "]"
      },
      desc: "Server acknowledges the client's sequence by setting $\\text{ack} = x + 1$, and generates its own sequence number $y$ with $\\text{SYN} = 1$."
    },
    {
      step: 3,
      title: "Step 3: Client acknowledges with final ACK",
      clientState: "ESTABLISHED",
      serverState: "SYN_RCVD",
      sender: "Client → Server",
      packet: {
        type: "ACK",
        flags: "SYN = 0, ACK = 1",
        seq: `seq = ${seqX + 1}`,
        ack: `ack = ${seqY + 1}`,
        latex: "\\text{ACK} \\quad [\\text{seq} = x + 1 = " + (seqX + 1) + ",\\, \\text{ack} = y + 1 = " + (seqY + 1) + "]"
      },
      desc: "Client acknowledges receipt of the server's sequence by setting $\\text{ack} = y + 1$. Connection is now established on client."
    },
    {
      step: 4,
      title: "Handshake Complete: Full-Duplex Connection Established",
      clientState: "ESTABLISHED",
      serverState: "ESTABLISHED",
      sender: "Bi-directional Data Stream",
      packet: {
        type: "DATA",
        flags: "ACK = 1, PSH = 1",
        seq: "Data payload transmission",
        ack: "Synchronized",
        latex: "\\text{Full-Duplex Stream Ready} \\iff \\text{ESTABLISHED}"
      },
      desc: "Both client and server have verified bi-directional reachability. Application data packets can now be exchanged safely."
    }
  ];

  // Auto-play ticker
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= 4) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStepData = stepsData[currentStep];

  const handleTriggerExplanation = (componentName, data) => {
    if (onComponentClick) {
      onComponentClick({
        component: `TCP Handshake Component: ${componentName}`,
        details: data
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>TCP 3-Way Handshake Connection Sequence</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                SYN → SYN-ACK → ACK
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Interactive client-server state transitions and sequence number arithmetic
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentStep(prev => Math.max(prev - 1, 0)); setIsPlaying(false); }}
            disabled={currentStep === 0}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs disabled:opacity-40"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Play Sequence"}</span>
          </button>
          <button
            onClick={() => { setCurrentStep(prev => Math.min(prev + 1, 4)); setIsPlaying(false); }}
            disabled={currentStep >= 4}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs disabled:opacity-40"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Handshake Timeline Stage */}
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto canvas-grid space-y-6">
        
        {/* State Machine Status Bar */}
        <div className="grid grid-cols-2 gap-4">
          {/* Client Node Card */}
          <div className="p-4 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Client (Initiator)
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  ISN: <MathRenderer text={`$x = ${seqX}$`} />
                </span>
              </div>
            </div>
            <button
              onClick={() => handleTriggerExplanation("Client State", `Client State is ${activeStepData.clientState}`)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                activeStepData.clientState === "ESTABLISHED"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : activeStepData.clientState === "SYN_SENT"
                  ? "bg-amber-500 text-white shadow-xs animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {activeStepData.clientState}
            </button>
          </div>

          {/* Server Node Card */}
          <div className="p-4 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Server (Listener)
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  ISN: <MathRenderer text={`$y = ${seqY}$`} />
                </span>
              </div>
            </div>
            <button
              onClick={() => handleTriggerExplanation("Server State", `Server State is ${activeStepData.serverState}`)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                activeStepData.serverState === "ESTABLISHED"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : activeStepData.serverState === "SYN_RCVD"
                  ? "bg-purple-500 text-white shadow-xs animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {activeStepData.serverState}
            </button>
          </div>
        </div>

        {/* Visual Animated Packet Flow Ladder */}
        <div className="p-5 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-semibold">Network Packet Ladder Diagram</span>
            <span className="text-[10px] font-mono text-blue-500 font-bold">Step {currentStep} / 4</span>
          </div>

          <div className="space-y-3">
            {/* Step 1: SYN Segment */}
            <div 
              onClick={() => handleTriggerExplanation("SYN Packet", stepsData[1].desc)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                currentStep >= 1 
                  ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600" 
                  : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-40"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">1. Client → Server: SYN</span>
                    <span className="px-2 py-0.2 bg-blue-500 text-white text-[9px] font-mono font-bold rounded">SYN=1, ACK=0</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300">
                    <MathRenderer text={`$\\text{seq} = x = ${seqX}$`} />
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500" />
            </div>

            {/* Step 2: SYN-ACK Segment */}
            <div 
              onClick={() => handleTriggerExplanation("SYN-ACK Packet", stepsData[2].desc)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                currentStep >= 2 
                  ? "bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600" 
                  : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-40"
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-purple-500" />
              <div className="flex items-center space-x-2.5 text-right">
                <div>
                  <div className="flex items-center justify-end space-x-2">
                    <span className="px-2 py-0.2 bg-purple-500 text-white text-[9px] font-mono font-bold rounded">SYN=1, ACK=1</span>
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200">2. Server → Client: SYN-ACK</span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300">
                    <MathRenderer text={`$\\text{seq} = y = ${seqY},\\, \\text{ack} = x + 1 = ${seqX + 1}$`} />
                  </span>
                </div>
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              </div>
            </div>

            {/* Step 3: ACK Segment */}
            <div 
              onClick={() => handleTriggerExplanation("ACK Packet", stepsData[3].desc)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                currentStep >= 3 
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600" 
                  : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-40"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">3. Client → Server: ACK</span>
                    <span className="px-2 py-0.2 bg-emerald-500 text-white text-[9px] font-mono font-bold rounded">SYN=0, ACK=1</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                    <MathRenderer text={`$\\text{seq} = x + 1 = ${seqX + 1},\\, \\text{ack} = y + 1 = ${seqY + 1}$`} />
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Current Step Explanation Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>{activeStepData.title}:</strong> <MathRenderer text={activeStepData.desc} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TCPHandshakeVisualizer;
