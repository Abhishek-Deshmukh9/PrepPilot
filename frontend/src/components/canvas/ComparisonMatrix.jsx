import React from "react";
import { Scale, CheckCircle, XCircle, Sparkles, HelpCircle } from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";

export const ComparisonMatrix = ({
  title = "Comparative Analysis: Search & Divide-and-Conquer Paradigms",
  columns = ["Metric / Attribute", "Linear Search", "Binary Search", "Hash Map Lookup"],
  rows = [
    {
      metric: "Best Case Time",
      values: ["$\\mathcal{O}(1)$", "$\\mathcal{O}(1)$", "$\\mathcal{O}(1)$"],
      highlight: 2
    },
    {
      metric: "Average Case Time",
      values: ["$\\mathcal{O}(n)$", "$\\mathcal{O}(\\log_2 n)$", "$\\mathcal{O}(1)$"],
      highlight: 1
    },
    {
      metric: "Worst Case Time",
      values: ["$\\mathcal{O}(n)$", "$\\mathcal{O}(\\log_2 n)$", "$\\mathcal{O}(n)$ (collisions)"],
      highlight: 1
    },
    {
      metric: "Auxiliary Space",
      values: ["$\\mathcal{O}(1)$ (in-place)", "$\\mathcal{O}(1)$ (iterative)", "$\\mathcal{O}(n)$ (hash table overhead)"],
      highlight: 1
    },
    {
      metric: "Prerequisites",
      values: ["None (works on unsorted data)", "Array MUST be sorted in monotonic order", "Hash function & load factor management"],
      highlight: null
    },
    {
      metric: "Access Pattern",
      values: ["Sequential access (arrays & linked lists)", "Direct random access $(\\text{arr}[i])$ required", "Direct key hashing"],
      highlight: null
    }
  ]
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-text">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-[10px] text-slate-400">
              Side-by-side trade-offs, constraints, and asymptotic complexity matrix
            </p>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-6 overflow-auto canvas-grid">
        <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 ${
                      idx === 0 ? "w-1/4" : "text-center"
                    } ${idx === 2 ? "bg-brand-500/10 text-brand-700 dark:text-brand-300 font-extrabold" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-900/20">
                    {row.metric}
                  </td>
                  {row.values.map((val, vIdx) => {
                    const isFocusCol = vIdx + 1 === 2; // Binary search column
                    return (
                      <td 
                        key={vIdx} 
                        className={`p-3.5 text-center leading-relaxed ${
                          isFocusCol 
                            ? "bg-brand-500/5 font-semibold text-brand-900 dark:text-brand-100" 
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <MathRenderer text={val} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
