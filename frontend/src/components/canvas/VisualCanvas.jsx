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
  activeTopic = "Binary Search Complexity",
  onComponentClick = null,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync activeTab whenever visualPayload specifies a visual_type
  useEffect(() => {
    if (visualPayload && visualPayload.visual_type) {
      setActiveTab(visualPayload.visual_type);
    }
  }, [visualPayload]);

  // Default Mermaid chart definition
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

    style A fill:#7c3aed,stroke:#6d28d9,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style I fill:#f43f5e,stroke:#e11d48,color:#fff
  `.trim();

  // Navigation tab configs
  const standardTabs = [
    { id: "study_navigator", label: "Study Navigator", icon: Compass, badge: "Mentor" },
    { id: "knowledge_graph", label: "Knowledge Graph", icon: BrainCircuit, badge: "Evolving Map" },
    { id: "step_by_step_visualization", label: "Array Halving", icon: Layers, badge: "Animation" },
    { id: "osi_model", label: "OSI 7-Layer Stack", icon: Network, badge: "Encapsulation" },
    { id: "tcp_handshake", label: "TCP 3-Way Handshake", icon: ShieldCheck, badge: "SYN/ACK" },
    { id: "dbms_normalization", label: "DBMS Normalization", icon: Database, badge: "1NF→3NF" },
    { id: "physics_vectors", label: "Newton's Force Vectors", icon: Compass, badge: "F=ma" },
    { id: "data_structure", label: "BST Data Structure", icon: GitBranch, badge: "Tree" },
    { id: "mathematical_derivation", label: "LaTeX Proof", icon: Calculator, badge: "LaTeX" },
    { id: "graph", label: "Complexity Curves", icon: TrendingUp, badge: "O(log n)" },
    { id: "diagram", label: "Mermaid Flowchart", icon: GitFork, badge: "Diagram" },
    { id: "comparison", label: "Trade-offs Matrix", icon: Scale, badge: "Matrix" },
    { id: "code_visualization", label: "Code Debugger", icon: Code2, badge: "Python" }
  ];

  return (
    <div className={`flex flex-col h-full bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden backdrop-blur-xl transition-all ${
      isFullscreen ? "fixed inset-4 z-50 bg-white/95 dark:bg-slate-950/95" : ""
    } ${className}`}>
      
      {/* Top Visual Canvas Navigation Bar */}
      <div className="px-4 py-2.5 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Tab Selectors */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
          {standardTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.02]"
                    : "bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200/60 dark:bg-slate-700 text-slate-500"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Fullscreen Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus Canvas"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Canvas Body */}
      <div className="flex-1 p-3 overflow-hidden bg-slate-50/40 dark:bg-slate-900/20">
        
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

        {/* Array Halving Simulation */}
        {(activeTab === "step_by_step_visualization" || activeTab === "auto") && (
          <StepByStepVisualizer
            initialArray={visualPayload?.array || [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 84, 91, 98, 105, 120, 142]}
            defaultTarget={visualPayload?.target || 23}
            topic={visualPayload?.title || activeTopic}
          />
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
