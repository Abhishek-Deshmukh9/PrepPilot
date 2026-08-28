import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Info, 
  ArrowRight,
  TrendingDown,
  HelpCircle
} from "lucide-react";
import { MathRenderer } from "../common/MathRenderer";

export const StepByStepVisualizer = ({
  initialArray = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 84, 91, 98, 105, 120, 142],
  defaultTarget = 23,
  topic = "Binary Search Interval Halving",
  onComponentClick = null
}) => {
  const [array, setArray] = useState(initialArray);
  const [target, setTarget] = useState(defaultTarget);
  const [inputTarget, setInputTarget] = useState(String(defaultTarget));
  
  // History of algorithm steps
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200); // ms per step
  const timerRef = useRef(null);

  // Recompute binary search execution steps whenever array or target changes
  useEffect(() => {
    const computedSteps = [];
    let left = 0;
    let right = array.length - 1;
    let stepCount = 0;
    let found = false;

    // Initial state step
    computedSteps.push({
      stepNumber: 0,
      left,
      right,
      mid: Math.floor((left + right) / 2),
      status: "initial",
      remainingCount: array.length,
      explanation: `Search space initialized with $n = ${array.length}$ elements. Interval $[L=${left}, R=${right}]$.`,
      latexState: `L = ${left},\\, R = ${right},\\, \\text{size} = ${array.length}`,
      activeIndices: Array.from({ length: array.length }, (_, i) => i)
    });

    while (left <= right) {
      stepCount++;
      const mid = Math.floor((left + right) / 2);
      const midVal = array[mid];
      const activeIndices = [];
      for (let i = left; i <= right; i++) activeIndices.push(i);

      if (midVal === target) {
        found = true;
        computedSteps.push({
          stepNumber: stepCount,
          left,
          right,
          mid,
          status: "found",
          remainingCount: activeIndices.length,
          explanation: `🎯 **Element Found!** $\\text{arr}[${mid}] = ${midVal} == ${target}$. Total comparisons: ${stepCount}.`,
          latexState: `\\text{arr}[mid] = ${midVal} = \\text{target} \\implies \\text{Found at index } ${mid}`,
          activeIndices
        });
        break;
      } else if (midVal < target) {
        computedSteps.push({
          stepNumber: stepCount,
          left,
          right,
          mid,
          status: "eliminate-left",
          remainingCount: activeIndices.length,
          explanation: `$\\text{arr}[${mid}] = ${midVal} < ${target}$. Eliminate left half $[${left}..${mid}]$ and search right half $[${mid + 1}..${right}]$.`,
          latexState: `\\text{arr}[${mid}] < ${target} \\implies L \\leftarrow mid + 1 = ${mid + 1}`,
          activeIndices
        });
        left = mid + 1;
      } else {
        computedSteps.push({
          stepNumber: stepCount,
          left,
          right,
          mid,
          status: "eliminate-right",
          remainingCount: activeIndices.length,
          explanation: `$\\text{arr}[${mid}] = ${midVal} > ${target}$. Eliminate right half $[${mid}..${right}]$ and search left half $[${left}..${mid - 1}]$.`,
          latexState: `\\text{arr}[${mid}] > ${target} \\implies R \\leftarrow mid - 1 = ${mid - 1}`,
          activeIndices
        });
        right = mid - 1;
      }
    }

    if (!found) {
      computedSteps.push({
        stepNumber: stepCount + 1,
        left,
        right,
        mid: -1,
        status: "not-found",
        remainingCount: 0,
        explanation: `Element ${target} does not exist in array. Search exhausted after $\\lceil \\log_2 ${array.length} \\rceil$ comparisons.`,
        latexState: `L > R \\implies \\text{Target not found}`,
        activeIndices: []
      });
    }

    setSteps(computedSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [array, target]);

  // Autoplay ticker
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, speed]);

  const handleApplyTarget = (e) => {
    e.preventDefault();
    const val = parseInt(inputTarget, 10);
    if (!isNaN(val)) {
      setTarget(val);
    }
  };

  const handleElementClick = (idx, val) => {
    if (onComponentClick) {
      const isMid = idx === currentStep.mid;
      if (isMid) {
        onComponentClick({
          component: "Midpoint Pointer (mid)",
          formula: "mid = left + \\lfloor (right - left) / 2 \\rfloor",
          role: "Identifies the midpoint of the active search range to eliminate half the elements in O(1) comparison.",
          details: `mid represents the middle position of the current search interval (index ${idx}, value ${val}). We compare A[mid] with target ${target} to decide whether to search the left or right half.`
        });
      } else {
        onComponentClick({
          component: `Array Element [${idx}] = ${val}`,
          role: "Sorted array element",
          details: `Element at index ${idx} holds value ${val}. In sorted order ($A[i] \\le A[i+1]$), any element left of mid is $< A[mid]$, and any element right of mid is $> A[mid]$.`
        });
      }
    }
  };

  const currentStep = steps[currentStepIndex] || {
    left: 0,
    right: array.length - 1,
    mid: Math.floor((array.length - 1) / 2),
    status: "initial",
    remainingCount: array.length,
    explanation: "",
    latexState: "",
    activeIndices: []
  };

  const maxStepsPossible = Math.ceil(Math.log2(array.length)) + 1;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Top Header & Search Control */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{topic}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                <MathRenderer text="$\mathcal{O}(\log_2 n)$ Interactive" />
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Click any element or mid pointer to trigger live AI Tutor explanation
            </p>
          </div>
        </div>

        {/* Custom Target Input Form */}
        <form onSubmit={handleApplyTarget} className="flex items-center space-x-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
              Target:
            </span>
            <input
              type="number"
              value={inputTarget}
              onChange={(e) => setInputTarget(e.target.value)}
              className="w-24 pl-12 pr-2 py-1 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Main Canvas Visual Area */}
      <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto canvas-grid space-y-4">
        
        {/* Halving Metric HUD Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Search Step
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
              <span>{currentStepIndex + 1}</span>
              <span className="text-[11px] text-slate-400 font-normal">of {steps.length}</span>
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Active Interval
            </span>
            <div className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{currentStep.remainingCount} items</span>
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Max Steps
            </span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              <MathRenderer text={`$\\lceil \\log_2 ${array.length} \\rceil = ${Math.ceil(Math.log2(array.length))}$`} />
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Recurrence
            </span>
            <div className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-0.5">
              <MathRenderer text="$T(n) = T(n/2) + 1$" />
            </div>
          </div>
        </div>

        {/* Array Visualization Stage */}
        <div className="p-4 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-between w-full text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Click any element or pointer to inspect:
            </span>
            <div className="flex items-center space-x-3 text-[10px] font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-brand-500 inline-block" /> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Midpoint
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700 inline-block" /> Eliminated
              </span>
            </div>
          </div>

          {/* Array Elements Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-full py-2">
            {array.map((val, idx) => {
              const isMid = idx === currentStep.mid;
              const isLeft = idx === currentStep.left;
              const isRight = idx === currentStep.right;
              const isActive = currentStep.activeIndices?.includes(idx);
              const isFound = isMid && currentStep.status === "found";

              return (
                <div 
                  key={idx} 
                  onClick={() => handleElementClick(idx, val)}
                  className="flex flex-col items-center group relative cursor-pointer hover:scale-105 transition-transform"
                >
                  {/* Pointer Marker Tags */}
                  <div className="h-4 flex items-center justify-center text-[9px] font-bold font-mono text-slate-400">
                    {isMid && (
                      <span className="px-1 py-0.2 bg-amber-500 text-white rounded shadow-xs animate-bounce">
                        mid
                      </span>
                    )}
                    {!isMid && isLeft && (
                      <span className="px-1 py-0.2 bg-blue-500 text-white rounded shadow-xs">
                        L
                      </span>
                    )}
                    {!isMid && isRight && (
                      <span className="px-1 py-0.2 bg-purple-500 text-white rounded shadow-xs">
                        R
                      </span>
                    )}
                  </div>

                  {/* Cell Box */}
                  <div
                    className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs sm:text-sm border-2 transition-all duration-300 ${
                      isFound
                        ? "bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                        : isMid
                        ? "bg-amber-500 border-amber-400 text-white scale-105 shadow-md shadow-amber-500/30"
                        : isActive
                        ? "bg-brand-50/80 dark:bg-brand-950/60 border-brand-400 dark:border-brand-600 text-brand-900 dark:text-brand-200"
                        : "bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 opacity-40 grayscale line-through"
                    }`}
                  >
                    <span>{val}</span>
                    <span className={`text-[8px] font-mono mt-0.5 ${isFound || isMid ? "text-white/80" : "text-slate-400"}`}>
                      [{idx}]
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Step State Bar */}
          <div className="w-full bg-slate-50 dark:bg-slate-900/80 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200">
              <span className="font-bold text-brand-600 dark:text-brand-400">Step {currentStepIndex + 1}:</span>
              <MathRenderer text={currentStep.explanation} />
            </div>
            <div className="px-2 py-0.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <MathRenderer text={`$${currentStep.latexState}$`} />
            </div>
          </div>
        </div>

        {/* Tree Halving Visual Pyramid */}
        <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-brand-500" />
            <span>Search Space Halving Hierarchy ($N \to N/2 \to N/4 \dots \to 1$)</span>
          </span>
          
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {Array.from({ length: maxStepsPossible }).map((_, level) => {
              const expectedSize = Math.max(1, Math.round(array.length / Math.pow(2, level)));
              const isPastOrCurrent = level <= currentStepIndex;
              const isCurrent = level === currentStepIndex;

              return (
                <div 
                  key={level}
                  className={`flex-1 min-w-16 p-1.5 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? "bg-brand-500 text-white border-brand-400 shadow-sm scale-105"
                      : isPastOrCurrent
                      ? "bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300"
                      : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase">L{level}</div>
                  <div className="text-xs font-mono font-bold mt-0.5">
                    <MathRenderer text={`$\\approx ${expectedSize}$`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Playback Control Bar */}
      <div className="p-3 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Playback Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs transition-colors"
            title="Restart to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setCurrentStepIndex(prev => Math.max(prev - 1, 0));
              setIsPlaying(false);
            }}
            disabled={currentStepIndex === 0}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
              setIsPlaying(false);
            }}
            disabled={currentStepIndex >= steps.length - 1}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Step Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Speed
          </span>
          <input
            type="range"
            min="400"
            max="2500"
            step="100"
            value={3000 - speed}
            onChange={(e) => setSpeed(3000 - Number(e.target.value))}
            className="w-20 accent-brand-600 cursor-pointer"
          />
          <span className="font-mono text-[10px] text-slate-400 min-w-8">
            {(speed / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepByStepVisualizer;
