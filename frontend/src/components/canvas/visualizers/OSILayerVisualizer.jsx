import React, { useState, useEffect } from "react";
import { 
  Network, 
  Send, 
  ArrowDown, 
  ArrowUp, 
  Layers, 
  Sparkles, 
  Info, 
  Play, 
  RotateCcw, 
  CheckCircle2,
  ShieldCheck,
  Radio,
  Server
} from "lucide-react";
import { MathRenderer } from "../../common/MathRenderer";

const OSI_LAYERS = [
  {
    number: 7,
    name: "Application Layer",
    pdu: "Data (APDU)",
    protocols: ["HTTP/HTTPS", "DNS", "SMTP", "SSH", "FTP"],
    role: "User-facing interface, network services, and application protocols.",
    color: "from-purple-600 to-indigo-600",
    border: "border-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    details: "Provides protocols directly utilized by end-user applications. Interfaces human-computer interaction."
  },
  {
    number: 6,
    name: "Presentation Layer",
    pdu: "Data (PPDU)",
    protocols: ["TLS/SSL", "JPEG", "ASCII", "MIME", "GZIP"],
    role: "Data formatting, character encoding, encryption/decryption, and compression.",
    color: "from-indigo-600 to-blue-600",
    border: "border-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    details: "Translates application data into standard formats, ensures encryption (TLS), and handles compression."
  },
  {
    number: 5,
    name: "Session Layer",
    pdu: "Data (SPDU)",
    protocols: ["NetBIOS", "RPC", "PPTP", "Sockets"],
    role: "Manages sessions, establishes, coordinates, and terminates connections between applications.",
    color: "from-blue-600 to-cyan-600",
    border: "border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    details: "Maintains session checkpoints, full-duplex / half-duplex communication tokens, and connection re-establishment."
  },
  {
    number: 4,
    name: "Transport Layer",
    pdu: "Segment (TCP) / Datagram (UDP)",
    protocols: ["TCP", "UDP", "QUIC", "SCTP"],
    role: "End-to-end reliable delivery, port addressing, flow control, and error recovery.",
    color: "from-cyan-600 to-teal-600",
    border: "border-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    details: "Segments data streams, adds Port numbers (e.g. 443, 80), manages sliding windows, sequence numbers, and congestion."
  },
  {
    number: 3,
    name: "Network Layer",
    pdu: "Packet",
    protocols: ["IPv4", "IPv6", "ICMP", "BGP", "OSPF"],
    role: "Logical addressing (IP), path determination, packet routing across subnet boundaries.",
    color: "from-teal-600 to-emerald-600",
    border: "border-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    details: "Assigns source and destination IP addresses, encapsulates transport segments into Packets, and computes routing tables."
  },
  {
    number: 2,
    name: "Data Link Layer",
    pdu: "Frame",
    protocols: ["Ethernet (802.3)", "Wi-Fi (802.11)", "PPP", "ARP", "VLAN"],
    role: "Physical MAC addressing, node-to-node frame delivery, collision detection (CSMA/CD).",
    color: "from-emerald-600 to-amber-600",
    border: "border-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    details: "Packages IP packets into Frames with source/destination MAC addresses and Frame Check Sequence (CRC checksum)."
  },
  {
    number: 1,
    name: "Physical Layer",
    pdu: "Bits (0s & 1s)",
    protocols: ["Cat6 RJ45", "Fiber Optic", "Radio Waves (RF)", "DSL"],
    role: "Transmits raw bitstreams over physical media (voltages, light pulses, radio frequencies).",
    color: "from-amber-600 to-rose-600",
    border: "border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    details: "Defines electrical voltages, pinouts, cable specifications, bit synchronization, and transmission rates."
  }
];

export const OSILayerVisualizer = ({
  onLayerClick = null,
  activeLayer = null
}) => {
  const [selectedLayerNum, setSelectedLayerNum] = useState(activeLayer || 4); // default Transport Layer
  const [animatingStep, setAnimatingStep] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const selectedLayer = OSI_LAYERS.find(l => l.number === selectedLayerNum) || OSI_LAYERS[3];

  const handleSelectLayer = (layer) => {
    setSelectedLayerNum(layer.number);
    if (onLayerClick) {
      onLayerClick({
        component: `OSI Layer ${layer.number}: ${layer.name}`,
        pdu: layer.pdu,
        protocols: layer.protocols.join(", "),
        role: layer.role,
        details: layer.details
      });
    }
  };

  const handleSimulatePacketFlow = () => {
    if (isSending) return;
    setIsSending(true);

    // Encapsulation flow: Layer 7 down to Layer 1
    const steps = [7, 6, 5, 4, 3, 2, 1];
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < steps.length) {
        setAnimatingStep(steps[idx]);
        setSelectedLayerNum(steps[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setAnimatingStep(null);
          setIsSending(false);
        }, 800);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>OSI 7-Layer Protocol Stack & Data Encapsulation</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Interactive Stack
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Click any layer to trigger AI explanation & packet flow analysis
            </p>
          </div>
        </div>

        {/* Action Button: Send Data Packet Animation */}
        <button
          onClick={handleSimulatePacketFlow}
          disabled={isSending}
          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          <Play className={`w-3.5 h-3.5 ${isSending ? "animate-spin" : ""}`} />
          <span>{isSending ? "Encapsulating Packet..." : "Simulate Packet Flow"}</span>
        </button>
      </div>

      {/* Main Stack Visual Area */}
      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto canvas-grid">
        
        {/* Vertical 7-Layer Stack */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
            <span className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-purple-500" />
              <span>Host A: Encapsulation (Down)</span>
            </span>
            <span className="flex items-center gap-1">
              <span>Host B: Decapsulation (Up)</span>
              <ArrowUp className="w-3 h-3 text-emerald-500" />
            </span>
          </div>

          {OSI_LAYERS.map((layer) => {
            const isSelected = selectedLayerNum === layer.number;
            const isCurrentPacketStep = animatingStep === layer.number;

            return (
              <button
                key={layer.number}
                onClick={() => handleSelectLayer(layer)}
                className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between group cursor-pointer relative ${
                  isSelected
                    ? `${layer.bg} ${layer.border} shadow-md scale-[1.01] ring-2 ring-purple-500/20`
                    : "bg-white/90 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700"
                }`}
              >
                {/* Animated Packet indicator badge */}
                {isCurrentPacketStep && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/30 animate-ping" />
                )}

                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs text-white bg-gradient-to-tr ${layer.color} shadow-xs`}>
                    {layer.number}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {layer.name}
                      </span>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold px-1.5 py-0.2 bg-purple-100/60 dark:bg-purple-950/60 rounded">
                        {layer.pdu}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                      {layer.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-32 justify-end">
                    {layer.protocols.slice(0, 3).map((prot, pIdx) => (
                      <span key={pIdx} className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {prot}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Layer Deep-Dive Inspector Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs text-white bg-gradient-to-tr ${selectedLayer.color}`}>
                  L{selectedLayer.number}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {selectedLayer.name}
                  </h4>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                    PDU: {selectedLayer.pdu}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSelectLayer(selectedLayer)}
                className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 rounded-lg text-[10px] font-bold border border-purple-200 dark:border-purple-800 transition-colors"
              >
                Explain in Tutor 💬
              </button>
            </div>

            {/* Core Function */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Primary Functionality:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedLayer.details}
              </p>
            </div>

            {/* Common Protocols Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Key Protocols:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLayer.protocols.map((prot, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {prot}
                  </span>
                ))}
              </div>
            </div>

            {/* Encapsulation Header Simulation Box */}
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 block">
                Header Added at Layer {selectedLayer.number}:
              </span>
              <div className="flex items-center space-x-1 font-mono text-[10px] overflow-x-auto py-1">
                {selectedLayer.number <= 2 && (
                  <span className="px-2 py-1 bg-emerald-500 text-white rounded font-bold">L2 MAC Frame</span>
                )}
                {selectedLayer.number <= 3 && (
                  <span className="px-2 py-1 bg-teal-500 text-white rounded font-bold">L3 IP Header</span>
                )}
                {selectedLayer.number <= 4 && (
                  <span className="px-2 py-1 bg-cyan-500 text-white rounded font-bold">L4 Port TCP</span>
                )}
                <span className="px-3 py-1 bg-purple-600 text-white rounded font-bold flex-1 text-center">
                  Payload Data
                </span>
                {selectedLayer.number === 2 && (
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded font-bold">CRC</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Mnemonic Alert */}
          <div className="p-3 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Exam Mnemonic (Top to Bottom):</span>
            </span>
            <p className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              <strong>A</strong>ll <strong>P</strong>eople <strong>S</strong>eem <strong>T</strong>o <strong>N</strong>eed <strong>D</strong>ata <strong>P</strong>rocessing
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OSILayerVisualizer;
