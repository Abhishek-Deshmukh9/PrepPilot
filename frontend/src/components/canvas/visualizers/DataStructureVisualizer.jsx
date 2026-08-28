import React, { useState } from "react";
import { GitBranch, Play, RotateCcw, Search, Plus, Sparkles, Layers, Info } from "lucide-react";
import { MathRenderer } from "../../common/MathRenderer";

export const DataStructureVisualizer = ({
  onComponentClick = null
}) => {
  const [treeNodes, setTreeNodes] = useState([
    { id: "root", val: 50, x: 200, y: 30, left: "n1", right: "n2", depth: 0 },
    { id: "n1", val: 30, x: 100, y: 90, left: "n3", right: "n4", depth: 1 },
    { id: "n2", val: 70, x: 300, y: 90, left: "n5", right: "n6", depth: 1 },
    { id: "n3", val: 20, x: 50, y: 150, left: null, right: null, depth: 2 },
    { id: "n4", val: 40, x: 150, y: 150, left: null, right: null, depth: 2 },
    { id: "n5", val: 60, x: 250, y: 150, left: null, right: null, depth: 2 },
    { id: "n6", val: 80, x: 350, y: 150, left: null, right: null, depth: 2 }
  ]);

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [traversalType, setTraversalType] = useState("inorder");

  const inorderValues = [20, 30, 40, 50, 60, 70, 80];
  const preorderValues = [50, 30, 20, 40, 70, 60, 80];

  const handleNodeClick = (node) => {
    setActiveNodeId(node.id);
    if (onComponentClick) {
      onComponentClick({
        component: `BST Node (Value: ${node.val})`,
        details: `Binary Search Tree node with value ${node.val} at tree depth ${node.depth}. Subtree invariant: Left subtrees contain values < ${node.val}, right subtrees contain values > ${node.val}.`
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Binary Search Tree (BST) & Pointer Visualizer</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <MathRenderer text="$\\mathcal{O}(\\log_2 n)$ Search" />
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Interactive node invariants, tree balance depth, and pointer traversals
            </p>
          </div>
        </div>

        {/* Traversal Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {["inorder", "preorder"].map((mode) => (
            <button
              key={mode}
              onClick={() => setTraversalType(mode)}
              className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                traversalType === mode
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tree Canvas */}
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto canvas-grid space-y-6">
        
        {/* SVG Tree Graph */}
        <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full text-xs text-slate-400 flex items-center justify-between pb-2 border-b mb-3">
            <span className="font-semibold">Tree Invariant: Left &lt; Root &lt; Right</span>
            <span className="text-[10px] font-mono text-teal-500 font-bold">Height <MathRenderer text="$h = 2$" /> (Balanced)</span>
          </div>

          <div className="w-full max-w-md h-56 relative flex items-center justify-center">
            <svg width="400" height="200" className="overflow-visible select-none">
              {/* Connecting Lines */}
              <line x1="200" y1="35" x2="100" y2="95" stroke="#94a3b8" strokeWidth="2" />
              <line x1="200" y1="35" x2="300" y2="95" stroke="#94a3b8" strokeWidth="2" />
              <line x1="100" y1="95" x2="50" y2="155" stroke="#94a3b8" strokeWidth="2" />
              <line x1="100" y1="95" x2="150" y2="155" stroke="#94a3b8" strokeWidth="2" />
              <line x1="300" y1="95" x2="250" y2="155" stroke="#94a3b8" strokeWidth="2" />
              <line x1="300" y1="95" x2="350" y2="155" stroke="#94a3b8" strokeWidth="2" />

              {/* Tree Nodes */}
              {treeNodes.map((node) => {
                const isSelected = activeNodeId === node.id;
                return (
                  <g 
                    key={node.id} 
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y + 5}
                      r="18"
                      className={`transition-all ${
                        isSelected 
                          ? "fill-teal-500 stroke-teal-300 stroke-4" 
                          : "fill-white dark:fill-slate-900 stroke-teal-600 stroke-2 group-hover:fill-teal-50"
                      }`}
                    />
                    <text
                      x={node.x}
                      y={node.y + 10}
                      textAnchor="middle"
                      className={`text-xs font-mono font-bold select-none ${
                        isSelected ? "fill-white" : "fill-slate-800 dark:fill-slate-100"
                      }`}
                    >
                      {node.val}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Traversal Output Sequence */}
          <div className="w-full mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium capitalize">{traversalType} Output:</span>
            <div className="flex items-center space-x-1.5 font-mono font-bold text-teal-600 dark:text-teal-400">
              {(traversalType === "inorder" ? inorderValues : preorderValues).map((v, i) => (
                <span key={i} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 rounded border border-teal-200 dark:border-teal-800">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataStructureVisualizer;
