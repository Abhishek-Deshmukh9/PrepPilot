import React, { useState } from "react";
import { TrendingUp, BarChart2, Zap, Info } from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";

export const ComplexityGraph = ({
  title = "Asymptotic Time Complexity Growth Curves",
  highlightedComplexity = "O(log n)"
}) => {
  const [inputN, setInputN] = useState(1024);

  // Compute operation counts for current n
  const n = inputN;
  const log2n = Math.max(1, Math.round(Math.log2(n)));
  const nlogn = Math.round(n * Math.log2(n));
  const nSquared = n <= 5000 ? n * n : Infinity;

  // Preset n sizes
  const presetSizes = [16, 64, 256, 1024, 4096, 65536, 1048576];

  // SVG coordinate generation for chart
  const width = 500;
  const height = 260;
  const padding = 40;

  // Points for curves (x from 1 to 50)
  const maxDomain = 50;
  const maxRange = 50;

  const pointsLog = [];
  const pointsLinear = [];
  const pointsNLogN = [];
  const pointsQuadratic = [];

  for (let x = 1; x <= maxDomain; x += 1) {
    const px = padding + ((x - 1) / (maxDomain - 1)) * (width - 2 * padding);
    
    // y = log2(x) * 6
    const yLog = Math.log2(x) * 5;
    const pyLog = height - padding - (yLog / maxRange) * (height - 2 * padding);
    pointsLog.push(`${px},${Math.max(padding, pyLog)}`);

    // y = x
    const yLin = x * 0.8;
    const pyLin = height - padding - (yLin / maxRange) * (height - 2 * padding);
    pointsLinear.push(`${px},${Math.max(padding, pyLin)}`);

    // y = x log(x) * 0.25
    const yNLog = x * Math.log2(x) * 0.2;
    const pyNLog = height - padding - (yNLog / maxRange) * (height - 2 * padding);
    if (pyNLog >= padding) pointsNLogN.push(`${px},${pyNLog}`);

    // y = x^2 * 0.03
    const yQuad = (x * x) * 0.025;
    const pyQuad = height - padding - (yQuad / maxRange) * (height - 2 * padding);
    if (pyQuad >= padding) pointsQuadratic.push(`${px},${pyQuad}`);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-[10px] text-slate-400">
              Visualizing how operations scale as input size <MathRenderer text="$n$" /> increases
            </p>
          </div>
        </div>

        {/* N Size Presets */}
        <div className="hidden sm:flex items-center space-x-1.5">
          <span className="text-[10px] font-bold text-slate-400 mr-1">Preset <MathRenderer text="$n$" />:</span>
          {presetSizes.slice(2, 6).map((size) => (
            <button
              key={size}
              onClick={() => setInputN(size)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                inputN === size 
                  ? "bg-brand-600 text-white shadow-xs" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50"
              }`}
            >
              {size.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 canvas-grid">
        
        {/* Interactive N Slider Bar */}
        <div className="p-4 bg-white/95 dark:bg-slate-950/95 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Simulate Input Array Size: <MathRenderer text={`$n = ${n.toLocaleString()}$`} />
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800">
              <MathRenderer text={`$2^{${log2n}} \\approx ${n.toLocaleString()}$`} />
            </span>
          </div>

          <input
            type="range"
            min="16"
            max="1048576"
            step="16"
            value={inputN}
            onChange={(e) => setInputN(Number(e.target.value))}
            className="w-full accent-brand-600 cursor-pointer"
          />

          {/* Operation Cost Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
              <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <MathRenderer text="$\\mathcal{O}(\\log_2 n)$ (Binary Search)" />
              </div>
              <div className="text-sm font-mono font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                {log2n} ops
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400">
                <MathRenderer text="$\\mathcal{O}(n)$ (Linear Search)" />
              </div>
              <div className="text-sm font-mono font-bold text-blue-900 dark:text-blue-200 mt-1">
                {n.toLocaleString()} ops
              </div>
            </div>

            <div className="p-2.5 bg-purple-50/80 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900/50">
              <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400">
                <MathRenderer text="$\\mathcal{O}(n \\log_2 n)$ (MergeSort)" />
              </div>
              <div className="text-sm font-mono font-bold text-purple-900 dark:text-purple-200 mt-1">
                {nlogn.toLocaleString()} ops
              </div>
            </div>

            <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50">
              <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
                <MathRenderer text="$\\mathcal{O}(n^2)$ (Nested Loops)" />
              </div>
              <div className="text-sm font-mono font-bold text-rose-900 dark:text-rose-200 mt-1 truncate">
                {nSquared === Infinity ? "> 10 Trillion" : nSquared.toLocaleString()} ops
              </div>
            </div>
          </div>
        </div>

        {/* SVG Graph Visualization Stage */}
        <div className="p-4 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Growth Curve Trajectories</span>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="text-emerald-500 font-bold">── <MathRenderer text="$\\mathcal{O}(\\log n)$" /></span>
              <span className="text-blue-500 font-bold">── <MathRenderer text="$\\mathcal{O}(n)$" /></span>
              <span className="text-purple-500 font-bold">── <MathRenderer text="$\\mathcal{O}(n \\log n)$" /></span>
              <span className="text-rose-500 font-bold">── <MathRenderer text="$\\mathcal{O}(n^2)$" /></span>
            </div>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            <svg width={width} height={height} className="overflow-visible select-none">
              {/* Axes */}
              <line x1={padding} y1={height - padding} x2={width - padding + 20} y2={height - padding} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={padding} y1={height - padding} x2={padding} y2={padding - 10} stroke="#94a3b8" strokeWidth="1.5" />
              
              {/* Axis Labels */}
              <text x={width - padding + 10} y={height - padding + 16} fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Input Size (n)</text>
              <text x={padding - 10} y={padding - 15} fill="#94a3b8" fontSize="10" fontFamily="sans-serif" textAnchor="end">Operations (Time)</text>

              {/* Grid Lines */}
              {[1, 2, 3, 4].map((i) => {
                const y = height - padding - (i * (height - 2 * padding)) / 4;
                return (
                  <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                );
              })}

              {/* Curves */}
              {/* Quadratic O(n^2) */}
              <polyline fill="none" stroke="#f43f5e" strokeWidth="2.5" points={pointsQuadratic.join(" ")} />
              
              {/* Linearithmic O(n log n) */}
              <polyline fill="none" stroke="#a855f7" strokeWidth="2.5" points={pointsNLogN.join(" ")} />

              {/* Linear O(n) */}
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={pointsLinear.join(" ")} />

              {/* Logarithmic O(log n) - Highlighted */}
              <polyline fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" points={pointsLog.join(" ")} />

              {/* End Labels on curves */}
              <text x={width - padding - 10} y={height - padding - 45} fill="#10b981" fontSize="11" fontWeight="bold">O(log n)</text>
              <text x={width - padding - 20} y={height - padding - 110} fill="#3b82f6" fontSize="11" fontWeight="bold">O(n)</text>
              <text x={width - padding - 80} y={padding + 15} fill="#a855f7" fontSize="11" fontWeight="bold">O(n log n)</text>
              <text x={padding + 85} y={padding + 15} fill="#f43f5e" fontSize="11" fontWeight="bold">O(n²)</text>
            </svg>
          </div>

          <div className="w-full mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2 border border-slate-200/60 dark:border-slate-800">
            <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <span>
              Even when <MathRenderer text="$n = 1,000,000$" />, <MathRenderer text="$\\mathcal{O}(\\log_2 n)$" /> takes only <strong>~20 operations</strong>, while <MathRenderer text="$\\mathcal{O}(n)$" /> takes <strong>1,000,000 operations</strong>. That is a <strong>50,000x speedup</strong>!
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplexityGraph;
