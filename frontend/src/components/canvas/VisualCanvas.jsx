import React, { useState, useEffect } from "react";
import { 
  Maximize2, 
  Minimize2, 
  Layers, 
  Calculator, 
  TrendingUp, 
  GitFork, 
  Scale, 
  Code2, 
  Sparkles, 
  Network, 
  ShieldCheck, 
  Database, 
  Compass, 
  GitBranch,
  BrainCircuit
} from "lucide-react";
import StepByStepVisualizer from "./StepByStepVisualizer";
import MathematicalDerivation from "./MathematicalDerivation";
import ComplexityGraph from "./ComplexityGraph";
import MermaidDiagram from "./MermaidDiagram";
import ComparisonMatrix from "./ComparisonMatrix";
import CodeVisualization from "./CodeVisualization";
import InteractiveKnowledgeGraph from "./InteractiveKnowledgeGraph";
import StudyNavigator from "../navigator/StudyNavigator";

// Specialized High-Pedagogy Educational Visualizers
import OSILayerVisualizer from "./visualizers/OSILayerVisualizer";
import TCPHandshakeVisualizer from "./visualizers/TCPHandshakeVisualizer";
import DBMSNormalizationVisualizer from "./visualizers/DBMSNormalizationVisualizer";
import PhysicsVectorVisualizer from "./visualizers/PhysicsVectorVisualizer";
import DataStructureVisualizer from "./visualizers/DataStructureVisualizer";

export const VisualCanvas = ({
  visualPayload = null,
  activeTopic = "Study Session",
  onComponentClick = null,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (visualPayload && visualPayload.visual_type) {
      setActiveTab(visualPayload.visual_type);
    }
  }, [visualPayload]);

  const defaultMermaidChart = `
graph TD
    A[Start: Binary Search on Array] --> B[Calculate Midpoint: mid = L + R / 2]
    B --> C{arr mid == Target?}
    C -- Yes --> D[Return mid: Target Found!]
    C -- No --> E{arr mid < Target?}
    E -- Yes --> F[L = mid + 1]
    E -- No --> G[R = mid - 1]
    F --> H{Is L <= R?}
    G --> H
    H -- Yes --> B
    H -- No --> I[Return -1: Target Not in Array]

    style A fill:#0ea5e9,stroke:#0284c7,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style I fill:#f43f5e,stroke:#e11d48,color:#fff
  `.trim();

  const standardTabs = [
    { id: "study_navigator", label: "Navigator", icon: Compass, badge: "AI" },
    { id: "knowledge_graph", label: "Graph", icon: BrainCircuit, badge: "Map" },
    { id: "step_by_step_visualization", label: "Step-by-Step", icon: Layers, badge: "Step" },
    { id: "mathematical_derivation", label: "Math Proof", icon: Calculator, badge: "LaTeX" },
    { id: "graph", label: "Complexity", icon: TrendingUp, badge: "O(n)" },
    { id: "diagram", label: "Flowchart", icon: GitFork, badge: "Flow" },
    { id: "comparison", label: "Matrix", icon: Scale, badge: "Diff" },
    { id: "code_visualization", label: "Trace", icon: Code2, badge: "Code" },
    { id: "osi_model", label: "OSI", icon: Network, badge: "Net" },
    { id: "tcp_handshake", label: "TCP", icon: ShieldCheck, badge: "TCP" },
    { id: "dbms_normalization", label: "DBMS", icon: Database, badge: "SQL" },
    { id: "physics_vectors", label: "Vectors", icon: Compass, badge: "Phys" },
    { id: "data_structure", label: "Trees", icon: GitBranch, badge: "DS" },
  ];

  return (
    <div className={`flex flex-col h-full glass-panel rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-2xl transition-all ${
      isFullscreen ? "fixed inset-4 z-50 bg-[#07090e]/95" : ""
    } ${className}`}>
      
      {/* Top Visual Canvas Navigation Bar */}
      <div className="px-3.5 py-2 bg-[#0c1017]/90 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Tab Selectors */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-none max-w-full">
          {standardTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono transition-all shrink-0 ${
                  isActive
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                    : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 border border-white/[0.04]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Fullscreen Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus Canvas"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Dynamic Canvas Body */}
      <div className="flex-1 p-3 overflow-hidden bg-black/20">
        
        {/* Proactive Study Navigator */}
        {activeTab === "study_navigator" && (
          <StudyNavigator
            onLaunchTask={(payload) => {
              if (payload.visual_type) {
                setActiveTab(payload.visual_type);
              }
            }}
          />
        )}

        {/* Interactive Evolving Knowledge Graph */}
        {activeTab === "knowledge_graph" && (
          <InteractiveKnowledgeGraph
            activeTopic={activeTopic}
            onLaunchVisual={(payload) => {
              if (payload.visual_type) {
                setActiveTab(payload.visual_type);
              }
            }}
          />
        )}

        {/* OSI 7-Layer Visualizer */}
        {activeTab === "osi_model" && (
          <OSILayerVisualizer
            onLayerClick={onComponentClick}
          />
        )}

        {/* TCP 3-Way Handshake Visualizer */}
        {activeTab === "tcp_handshake" && (
          <TCPHandshakeVisualizer
            onComponentClick={onComponentClick}
          />
        )}

        {/* DBMS Normalization Transformer */}
        {activeTab === "dbms_normalization" && (
          <DBMSNormalizationVisualizer
            onComponentClick={onComponentClick}
          />
        )}

        {/* Newton's Laws & Vector Simulator */}
        {activeTab === "physics_vectors" && (
          <PhysicsVectorVisualizer
            onComponentClick={onComponentClick}
          />
        )}

        {/* BST Data Structure Visualizer */}
        {activeTab === "data_structure" && (
          <DataStructureVisualizer
            onComponentClick={onComponentClick}
          />
        )}

        {/* Step-by-Step Visualizer */}
        {(activeTab === "step_by_step_visualization" || activeTab === "auto") && (
          visualPayload?.array ? (
            <StepByStepVisualizer
              initialArray={visualPayload.array}
              defaultTarget={visualPayload.target}
              topic={visualPayload.title || activeTopic}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-3">
              <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20">
                <Layers className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <p className="text-xs font-bold text-slate-300">No step-by-step trace requested yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                Ask a question about an algorithm or step-by-step process in chat, and PrepPilot will render an interactive visualizer here.
              </p>
            </div>
          )
        )}

        {/* Mathematical Derivation */}
        {activeTab === "mathematical_derivation" && (
          <MathematicalDerivation
            title={visualPayload?.derivation_title || "Mathematical Derivation: Binary Search Time Complexity"}
            prerequisites={visualPayload?.prerequisites || [
              "Repeated division by $2$ ($n \\to \\frac{n}{2} \\to \\frac{n}{4} \\dots \\to 1$)",
              "Logarithm Definition: $2^k = n \\iff k = \\log_2 n$",
              "Recurrence Form: $T(n) = T(n/2) + \\mathcal{O}(1)$"
            ]}
            steps={visualPayload?.derivation_steps || undefined}
            conclusion={visualPayload?.derivation_conclusion || undefined}
          />
        )}

        {/* Complexity Growth Curves */}
        {activeTab === "graph" && (
          <ComplexityGraph
            title={visualPayload?.graph_title || "Asymptotic Growth Rates: O(1) vs O(log n) vs O(n) vs O(n²)"}
          />
        )}

        {/* Mermaid Diagram / Flowchart */}
        {(activeTab === "diagram" || activeTab === "flowchart" || activeTab === "concept_map" || activeTab === "timeline") && (
          <MermaidDiagram
            chartDefinition={visualPayload?.mermaid_code || defaultMermaidChart}
            title={visualPayload?.diagram_title || "Concept Decision Tree & Flowchart"}
          />
        )}

        {/* Comparison Matrix */}
        {activeTab === "comparison" && (
          <ComparisonMatrix
            title={visualPayload?.comparison_title || "Comparative Trade-offs & Complexity Matrix"}
            columns={visualPayload?.comparison_columns || undefined}
            rows={visualPayload?.comparison_rows || undefined}
          />
        )}

        {/* Code Visualization */}
        {activeTab === "code_visualization" && (
          <CodeVisualization
            title={visualPayload?.code_title || "Algorithm Execution & State Memory Tracker"}
            codeLines={visualPayload?.code_lines || undefined}
            traceSteps={visualPayload?.trace_steps || undefined}
          />
        )}

      </div>

    </div>
  );
};

export default VisualCanvas;
