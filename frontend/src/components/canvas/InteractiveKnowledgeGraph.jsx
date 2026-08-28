import React, { useState, useMemo } from "react";
import { 
  Network, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  Lock, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Search, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  Maximize2, 
  RotateCcw,
  Zap,
  TrendingUp,
  BrainCircuit,
  Eye,
  Sliders,
  ExternalLink,
  ChevronDown,
  X
} from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";
import WhyRecommendationBadge from "../companion/WhyRecommendationBadge";

/**
 * Node Status Types:
 * - 'mastered': Emerald (check)
 * - 'learning': Blue (pulse ring)
 * - 'weak': Rose (alert)
 * - 'prerequisite': Amber (key / prereq gap)
 * - 'not_started': Slate (dotted / lock)
 */

export const INITIAL_KNOWLEDGE_GRAPH = {
  domain: "Computer Science & Engineering",
  nodes: [
    {
      id: "ds_root",
      label: "Data Structures & Core Memory",
      category: "Data Structures",
      status: "mastered",
      masteryScore: 92,
      parentId: null,
      x: 50, y: 15,
      explanation: "Fundamental abstractions for organizing, storing, and accessing data in memory efficiently ($O(1)$ to $O(n)$ access patterns).",
      formulas: ["Memory Address: $\\text{Loc}(A[i]) = \\text{Base} + i \\times \\text{sizeof}(T)$"],
      prerequisites: [],
      visualType: "step_by_step_visualization",
      practiceQuestions: [
        { q: "Why do contiguous arrays provide $O(1)$ random access?", a: "Direct index arithmetic using the base address." }
      ]
    },
    {
      id: "arrays",
      label: "Arrays & Monotonic Bounds",
      category: "Data Structures",
      status: "mastered",
      masteryScore: 88,
      parentId: "ds_root",
      x: 20, y: 35,
      explanation: "Contiguous block of static memory supporting cache-friendly sequential and random access.",
      formulas: ["Search Time (Sorted): $\\mathcal{O}(\\log_2 n)$", "Insertion Time: $\\mathcal{O}(n)$"],
      prerequisites: ["ds_root"],
      visualType: "step_by_step_visualization",
      practiceQuestions: [
        { q: "What is the worst-case insertion time into a static array?", a: "$\\mathcal{O}(n)$ due to shifting elements." }
      ]
    },
    {
      id: "linked_lists",
      label: "Linked Lists & Pointers",
      category: "Data Structures",
      status: "learning",
      masteryScore: 65,
      parentId: "ds_root",
      x: 50, y: 35,
      explanation: "Linear collection of independent heap-allocated node structures connected via pointer references.",
      formulas: ["Head Insertion: $\\mathcal{O}(1)$", "k-th Search: $\\mathcal{O}(k)$"],
      prerequisites: ["ds_root"],
      visualType: "code_visualization",
      practiceQuestions: [
        { q: "Why does a linked list take $O(n)$ time to access the $k$-th element?", a: "Must traverse pointers sequentially from the head node." }
      ]
    },
    {
      id: "trees_root",
      label: "Hierarchical Trees",
      category: "Data Structures",
      status: "learning",
      masteryScore: 72,
      parentId: "ds_root",
      x: 80, y: 35,
      explanation: "Non-linear acyclic hierarchical structure composed of a root node and subtree branches.",
      formulas: ["Max Nodes at Depth $d$: $2^d$", "Tree Height: $h = \\log_2 n$"],
      prerequisites: ["linked_lists"],
      visualType: "data_structure",
      practiceQuestions: [
        { q: "How many maximum nodes can exist in a binary tree of height $h$?", a: "$2^{h+1} - 1$ total nodes." }
      ]
    },
    {
      id: "bst",
      label: "Binary Search Trees (BST)",
      category: "Data Structures",
      status: "weak",
      masteryScore: 40,
      parentId: "trees_root",
      x: 70, y: 60,
      explanation: "Binary tree maintaining the ordering invariant: $\\forall x \\in \\text{Left}, x < \\text{Root}$ and $\\forall y \\in \\text{Right}, y > \\text{Root}$.",
      formulas: ["Inorder Traversal: $\\Theta(n)$ sorted output", "Skewed Worst Case: $\\mathcal{O}(n)$"],
      prerequisites: ["trees_root", "arrays"],
      visualType: "data_structure",
      practiceQuestions: [
        { q: "What happens to BST search time when elements are inserted in sorted order?", a: "Degenerates to a linked list taking $\\mathcal{O}(n)$ time." }
      ]
    },
    {
      id: "avl",
      label: "AVL Balanced Trees",
      category: "Data Structures",
      status: "prerequisite",
      masteryScore: 20,
      parentId: "bst",
      x: 70, y: 85,
      explanation: "Self-balancing BST where the balance factor $|h_L - h_R| \\le 1$ is maintained via tree rotations.",
      formulas: ["Balance Factor: $\\text{BF} = h(\\text{left}) - h(\\text{right}) \\in \\{-1, 0, +1\\}$", "Guaranteed Search: $\\mathcal{O}(\\log_2 n)$"],
      prerequisites: ["bst"],
      visualType: "data_structure",
      practiceQuestions: [
        { q: "What tree rotations are required for a Left-Right (LR) imbalance?", a: "Left rotation on left child, followed by Right rotation on parent." }
      ]
    },
    {
      id: "graphs",
      label: "Graphs & Traversal (BFS/DFS)",
      category: "Data Structures",
      status: "not_started",
      masteryScore: 0,
      parentId: "trees_root",
      x: 90, y: 60,
      explanation: "Pair $G = (V, E)$ of vertices and edges with cyclic connectivity, traversed via queue-based BFS or stack-based DFS.",
      formulas: ["BFS/DFS Time: $\\mathcal{O}(V + E)$", "Adjacency Matrix Space: $\\mathcal{O}(V^2)$"],
      prerequisites: ["trees_root", "linked_lists"],
      visualType: "mermaid_diagram",
      practiceQuestions: [
        { q: "Which data structure is used for Breadth-First Search (BFS)?", a: "A FIFO Queue." }
      ]
    },
    {
      id: "recursion_dp",
      label: "Dynamic Programming & Recursion",
      category: "Algorithms",
      status: "weak",
      masteryScore: 35,
      parentId: "ds_root",
      x: 35, y: 60,
      explanation: "Optimization technique decomposing problems into overlapping subproblems with optimal substructure.",
      formulas: ["Fibonacci Recurrence: $T(n) = T(n-1) + T(n-2) + \\mathcal{O}(1)$", "Memoized Lookup: $\\mathcal{O}(n)$ time"],
      prerequisites: ["arrays", "linked_lists"],
      visualType: "code_visualization",
      practiceQuestions: [
        { q: "Why is a base case mandatory in recursion?", a: "To prevent infinite call stack expansion and recursion depth limit crashes." }
      ]
    },
    {
      id: "osi_model",
      label: "OSI 7-Layer Protocol Stack",
      category: "Networks",
      status: "mastered",
      masteryScore: 90,
      parentId: null,
      x: 15, y: 80,
      explanation: "7-layer vertical abstraction model for computer networks ($L_7 \\to L_1$ encapsulation).",
      formulas: ["Encapsulation: $\\text{Data} \\to \\text{Segment} \\to \\text{Packet} \\to \\text{Frame} \\to \\text{Bits}$"],
      prerequisites: [],
      visualType: "osi_model",
      practiceQuestions: [
        { q: "Which layer handles end-to-end port multiplexing?", a: "Layer 4 (Transport Layer)." }
      ]
    },
    {
      id: "tcp_handshake",
      label: "TCP 3-Way Handshake",
      category: "Networks",
      status: "weak",
      masteryScore: 48,
      parentId: "osi_model",
      x: 35, y: 85,
      explanation: "Full-duplex connection synchronization using 3 packets: $\\text{SYN}(x) \\to \\text{SYN-ACK}(y, x+1) \\to \\text{ACK}(y+1)$.",
      formulas: ["Sequence Acknowledgment: $\\text{ack} = \\text{seq} + 1$"],
      prerequisites: ["osi_model"],
      visualType: "tcp_handshake",
      practiceQuestions: [
        { q: "Why are 3 packets needed instead of 2?", a: "To prove the client received the server's sequence number $y$." }
      ]
    }
  ]
};

export const InteractiveKnowledgeGraph = ({
  onSelectConcept = null,
  onLaunchVisual = null,
  activeTopic = "Data Structures"
}) => {
  const [graphData, setGraphData] = useState(INITIAL_KNOWLEDGE_GRAPH);
  const [selectedNodeId, setSelectedNodeId] = useState("bst");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedNode = useMemo(() => {
    return graphData.nodes.find(n => n.id === selectedNodeId) || graphData.nodes[0];
  }, [graphData, selectedNodeId]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter(node => {
      const matchCat = activeCategoryFilter === "all" || node.category === activeCategoryFilter;
      const matchStatus = activeStatusFilter === "all" || node.status === activeStatusFilter;
      const matchSearch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase()) || node.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [graphData, activeCategoryFilter, activeStatusFilter, searchQuery]);

  // Status visual configs
  const statusConfigs = {
    mastered: {
      label: "Mastered",
      badge: "bg-emerald-500 text-white shadow-emerald-500/20",
      border: "border-emerald-500",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: CheckCircle2,
      dot: "bg-emerald-500"
    },
    learning: {
      label: "Learning",
      badge: "bg-blue-500 text-white shadow-blue-500/20",
      border: "border-blue-500",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      icon: TrendingUp,
      dot: "bg-blue-500 animate-pulse"
    },
    weak: {
      label: "Weak Area",
      badge: "bg-rose-500 text-white shadow-rose-500/20",
      border: "border-rose-500",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      icon: AlertTriangle,
      dot: "bg-rose-500 animate-bounce"
    },
    prerequisite: {
      label: "Prerequisite Gap",
      badge: "bg-amber-500 text-white shadow-amber-500/20",
      border: "border-amber-500",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      icon: Zap,
      dot: "bg-amber-500"
    },
    not_started: {
      label: "Not Started",
      badge: "bg-slate-400 text-white",
      border: "border-slate-300 dark:border-slate-700 border-dashed",
      glow: "",
      bg: "bg-slate-50 dark:bg-slate-900/40",
      icon: Lock,
      dot: "bg-slate-400"
    }
  };

  // Node Status Toggler (for testing dynamic knowledge evolution)
  const handleCycleStatus = (nodeId) => {
    const cycleOrder = ["not_started", "prerequisite", "weak", "learning", "mastered"];
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => {
        if (n.id === nodeId) {
          const currentIdx = cycleOrder.indexOf(n.status);
          const nextStatus = cycleOrder[(currentIdx + 1) % cycleOrder.length];
          const newScore = nextStatus === "mastered" ? 95 : nextStatus === "learning" ? 70 : nextStatus === "weak" ? 40 : nextStatus === "prerequisite" ? 20 : 0;
          return { ...n, status: nextStatus, masteryScore: newScore };
        }
        return n;
      })
    }));
  };

  // Count metrics
  const stats = useMemo(() => {
    const total = graphData.nodes.length;
    const mastered = graphData.nodes.filter(n => n.status === "mastered").length;
    const weak = graphData.nodes.filter(n => n.status === "weak").length;
    const learning = graphData.nodes.filter(n => n.status === "learning").length;
    return { total, mastered, weak, learning, percent: Math.round((mastered / total) * 100) };
  }, [graphData]);

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-text">
      
      {/* Top Knowledge Map Navigation & Filters */}
      <div className="p-4 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Title & Evolving Stats */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Interactive Knowledge Graph
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                {stats.percent}% Syllabus Mastered
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Evolving student knowledge state with prerequisite dependency links
            </p>
          </div>
        </div>

        {/* Status Legend Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto text-[10px] font-semibold">
          {Object.entries(statusConfigs).map(([statusKey, cfg]) => (
            <button
              key={statusKey}
              onClick={() => setActiveStatusFilter(activeStatusFilter === statusKey ? "all" : statusKey)}
              className={`px-2 py-1 rounded-lg border transition-all flex items-center space-x-1 shrink-0 ${
                activeStatusFilter === statusKey 
                  ? `${cfg.badge} font-bold scale-105` 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout: Graph Stage (Left 7 cols) & Node Inspector (Right 5 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3.5 overflow-hidden">
        
        {/* GRAPH STAGE: Interactive Concept Network */}
        <div className="lg:col-span-7 h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm relative overflow-hidden flex flex-col">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-brand-500" />
              <span>Concept Dependency Hierarchy</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Click any node to inspect or cycle status
            </span>
          </div>

          {/* Connected Concept Node Hierarchy */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 canvas-grid">
            
            {/* Tree Branch Visualizer */}
            <div className="space-y-4">
              
              {/* Category Group 1: Data Structures */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Data Structures & Trees Hierarchy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-2 border-l-2 border-brand-200 dark:border-brand-900">
                  {filteredNodes.filter(n => n.category === "Data Structures").map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const cfg = statusConfigs[node.status] || statusConfigs.not_started;
                    const Icon = cfg.icon;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left select-none relative group ${
                          isSelected
                            ? `${cfg.border} bg-brand-50/40 dark:bg-brand-950/30 ${cfg.glow} scale-[1.02]`
                            : "bg-slate-50/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {node.label}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {node.explanation}
                        </p>

                        {/* Progress Bar & Cycle Action */}
                        <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-400">Mastery:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                              {node.masteryScore}%
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycleStatus(node.id);
                            }}
                            className="text-[9px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                            title="Simulate student progress: cycle node status"
                          >
                            Cycle Status ↻
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Group 2: Networks & Systems */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Network className="w-3.5 h-3.5" />
                  <span>Computer Networks & Protocols</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-2 border-l-2 border-purple-200 dark:border-purple-900">
                  {filteredNodes.filter(n => n.category === "Networks").map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const cfg = statusConfigs[node.status] || statusConfigs.not_started;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left select-none ${
                          isSelected
                            ? `${cfg.border} bg-purple-50/40 dark:bg-purple-950/30 ${cfg.glow} scale-[1.02]`
                            : "bg-slate-50/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {node.label}
                            </span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {node.explanation}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-400">Mastery:</span>
                            <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{node.masteryScore}%</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCycleStatus(node.id); }}
                            className="text-[9px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                          >
                            Cycle Status ↻
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* NODE INSPECTOR DRAWER (Right 5 cols): Opened on node click */}
        <div className="lg:col-span-5 h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col space-y-3.5 overflow-y-auto">
          
          {/* Header */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider block">
                {selectedNode.category} Concept Node
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedNode.label}
              </h4>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfigs[selectedNode.status].badge}`}>
              {statusConfigs[selectedNode.status].label}
            </span>
          </div>

          {/* Concise Pedagogical Explanation */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Concise Explanation ($LaTeX$)
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              <MathRenderer text={selectedNode.explanation} />
            </p>
          </div>

          {/* Key Formulas & Notes */}
          {selectedNode.formulas && selectedNode.formulas.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-brand-500" />
                <span>Related Formulas & Notes</span>
              </span>
              <div className="space-y-1">
                {selectedNode.formulas.map((f, idx) => (
                  <div key={idx} className="p-2 bg-brand-50/40 dark:bg-brand-950/20 rounded-lg border border-brand-200/50 dark:border-brand-900/30 text-xs text-slate-800 dark:text-slate-200">
                    <MathRenderer text={f} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisite Dependencies */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Prerequisites</span>
              </span>
              <WhyRecommendationBadge
                type="prerequisite"
                customReason={`Recommended because prerequisite concepts must reach 80% mastery before advancing in ${selectedNode.label}.`}
                variant="icon"
              />
            </div>

            {selectedNode.prerequisites.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic pl-1">No prior dependencies (Foundational Root Node).</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.prerequisites.map((prereqId) => {
                  const target = graphData.nodes.find(n => n.id === prereqId);
                  return (
                    <button
                      key={prereqId}
                      onClick={() => setSelectedNodeId(prereqId)}
                      className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-[10px] font-semibold flex items-center space-x-1 hover:scale-105 transition-transform"
                    >
                      <span>{target ? target.label : prereqId}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Practice Questions */}
          {selectedNode.practiceQuestions && selectedNode.practiceQuestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-emerald-500" />
                  <span>Targeted Practice</span>
                </span>
                <WhyRecommendationBadge
                  type="practice_question"
                  customReason={`Recommended practice for ${selectedNode.label} based on recent error frequency.`}
                  variant="icon"
                />
              </div>

              {selectedNode.practiceQuestions.map((pq, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                    <MathRenderer text={pq.q} />
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                    Answer: <MathRenderer text={pq.a} />
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Launch Visual on Canvas Action */}
          <div className="pt-2">
            <button
              onClick={() => onLaunchVisual && onLaunchVisual({ title: selectedNode.label, visual_type: selectedNode.visualType })}
              className="w-full p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Launch Visual Explanation for {selectedNode.label}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InteractiveKnowledgeGraph;
