import React, { useState } from "react";
import { Code2, Play, Pause, SkipForward, SkipBack, RotateCcw, Variable, Terminal } from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";

export const CodeVisualization = ({
  title = "Algorithm Code Walkthrough & State Inspector",
  language = "python",
  codeLines = [
    "def binary_search(arr, target):",
    "    left, right = 0, len(arr) - 1",
    "    while left <= right:",
    "        mid = (left + right) // 2  # Find midpoint",
    "        if arr[mid] == target:",
    "            return mid             # Target found!",
    "        elif arr[mid] < target:",
    "            left = mid + 1         # Discard left half",
    "        else:",
    "            right = mid - 1        # Discard right half",
    "    return -1                      # Not present"
  ],
  traceSteps = [
    { line: 2, vars: { left: 0, right: 15, mid: "None", "arr[mid]": "None" }, desc: "Initialize search bounds $L = 0, R = 15$ ($n = 16$ elements)." },
    { line: 3, vars: { left: 0, right: 15, mid: "None", "arr[mid]": "None" }, desc: "Check condition: $0 \\le 15$ is True. Loop enters." },
    { line: 4, vars: { left: 0, right: 15, mid: 7, "arr[mid]": 45 }, desc: "Calculate midpoint: $mid = \\lfloor \\frac{0 + 15}{2} \\rfloor = 7$. Value $\\text{arr}[7] = 45$." },
    { line: 5, vars: { left: 0, right: 15, mid: 7, "arr[mid]": 45 }, desc: "Compare: is $\\text{arr}[7] == 23$? False ($45 \\ne 23$)." },
    { line: 7, vars: { left: 0, right: 15, mid: 7, "arr[mid]": 45 }, desc: "Compare: is $\\text{arr}[7] < 23$? False ($45 > 23$)." },
    { line: 10, vars: { left: 0, right: 6, mid: 7, "arr[mid]": 45 }, desc: "Execute else branch: $R \\leftarrow mid - 1 = 6$. Search space halved $16 \\to 7$!" },
    { line: 3, vars: { left: 0, right: 6, mid: 7, "arr[mid]": 45 }, desc: "Check condition: $0 \\le 6$ is True." },
    { line: 4, vars: { left: 0, right: 6, mid: 3, "arr[mid]": 12 }, desc: "Calculate midpoint: $mid = \\lfloor \\frac{0 + 6}{2} \\rfloor = 3$. Value $\\text{arr}[3] = 12$." },
    { line: 5, vars: { left: 0, right: 6, mid: 3, "arr[mid]": 12 }, desc: "Compare: is $\\text{arr}[3] == 23$? False ($12 \\ne 23$)." },
    { line: 7, vars: { left: 4, right: 6, mid: 3, "arr[mid]": 12 }, desc: "Compare: $\\text{arr}[3] = 12 < 23$ is True $\\implies L \\leftarrow mid + 1 = 4$." },
    { line: 3, vars: { left: 4, right: 6, mid: 3, "arr[mid]": 12 }, desc: "Check condition: $4 \\le 6$ is True." },
    { line: 4, vars: { left: 4, right: 6, mid: 5, "arr[mid]": 23 }, desc: "Calculate midpoint: $mid = \\lfloor \\frac{4 + 6}{2} \\rfloor = 5$. Value $\\text{arr}[5] = 23$." },
    { line: 5, vars: { left: 4, right: 6, mid: 5, "arr[mid]": 23 }, desc: "🎯 Target match: $\\text{arr}[5] == 23$ is True!" },
    { line: 6, vars: { left: 4, right: 6, mid: 5, "arr[mid]": 23 }, desc: "Return index 5. Search complete in 3 comparisons ($\\,\\le \\lceil \\log_2 16 \\rceil = 4$)." }
  ]
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const currentTrace = traceSteps[stepIdx] || traceSteps[0];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-[10px] text-slate-400">
              Step-by-step debugger & memory variable state tracker
            </p>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
          Step {stepIdx + 1} / {traceSteps.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-auto canvas-grid">
        {/* Code Editor Panel */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-md font-mono text-xs overflow-auto">
          <div className="flex items-center space-x-2 text-slate-500 text-[10px] pb-3 mb-2 border-b border-slate-800">
            <Terminal className="w-3 h-3 text-brand-400" />
            <span>binary_search.py</span>
          </div>

          <div className="space-y-1">
            {codeLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === currentTrace.line;

              return (
                <div
                  key={idx}
                  className={`flex items-center px-2 py-0.5 rounded transition-colors ${
                    isActive
                      ? "bg-brand-500/30 text-brand-200 font-bold border-l-4 border-brand-400 pl-3"
                      : "text-slate-300 opacity-80"
                  }`}
                >
                  <span className="w-6 text-slate-600 select-none text-[10px]">
                    {lineNum}
                  </span>
                  <pre className="flex-1 overflow-x-auto whitespace-pre font-mono text-xs">
                    {lineText}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* State Inspector & Explanation Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Variables Table */}
          <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Variable className="w-3.5 h-3.5 text-amber-500" />
              <span>Variable Memory Inspector</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(currentTrace.vars).map(([k, v]) => (
                <div key={k} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">{k}</div>
                  <div className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                    {String(v)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Explanation Card */}
          <div className="flex-1 bg-white/95 dark:bg-slate-950/95 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Execution State Rationale
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <MathRenderer text={currentTrace.desc} />
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStepIdx(0)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 text-xs transition-colors"
                title="Reset Execution"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStepIdx(prev => Math.max(prev - 1, 0))}
                  disabled={stepIdx === 0}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors flex items-center space-x-1"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={() => setStepIdx(prev => Math.min(prev + 1, traceSteps.length - 1))}
                  disabled={stepIdx >= traceSteps.length - 1}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors flex items-center space-x-1 shadow-sm"
                >
                  <span>Next Step</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeVisualization;
