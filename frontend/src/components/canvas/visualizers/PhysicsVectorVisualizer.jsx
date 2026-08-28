import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Activity, 
  Sliders,
  TrendingUp
} from "lucide-react";
import { MathRenderer } from "../../common/MathRenderer";

export const PhysicsVectorVisualizer = ({
  onComponentClick = null
}) => {
  // Simulation physics parameters
  const [mass, setMass] = useState(5); // kg
  const [appliedForce, setAppliedForce] = useState(40); // N
  const [frictionCoeff, setFrictionCoeff] = useState(0.25); // mu
  const [isSimulating, setIsSimulating] = useState(false);

  // Dynamic kinematic states
  const [posX, setPosX] = useState(40); // px
  const [velocity, setVelocity] = useState(0); // m/s
  const animFrameRef = useRef(null);

  // Physics calculations (g = 9.8 m/s^2)
  const g = 9.8;
  const gravityForce = Number((mass * g).toFixed(1)); // F_g = mg
  const normalForce = gravityForce; // F_N = mg on flat plane
  const maxStaticFriction = Number((frictionCoeff * normalForce).toFixed(1));
  const frictionForce = appliedForce > maxStaticFriction ? maxStaticFriction : appliedForce;
  const netForce = Math.max(0, Number((appliedForce - frictionForce).toFixed(1)));
  const acceleration = Number((netForce / mass).toFixed(2)); // a = F_net / m

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isSimulating && acceleration > 0) {
        setVelocity(prevV => {
          const nextV = prevV + acceleration * dt;
          setPosX(prevX => {
            const nextX = prevX + nextV * dt * 25; // scaled for screen
            if (nextX > 380) return 40; // loop around
            return nextX;
          });
          return nextV;
        });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulating, acceleration]);

  const handleReset = () => {
    setIsSimulating(false);
    setPosX(40);
    setVelocity(0);
  };

  const handleTriggerExplanation = (forceName, formula, desc) => {
    if (onComponentClick) {
      onComponentClick({
        component: `Newton's Laws & Vector: ${forceName}`,
        formula,
        details: desc
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Newton's Laws & Free-Body Vector Simulator</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <MathRenderer text="$\\vec{F}_{\\text{net}} = m\\vec{a}$" />
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Real-time vector mechanics: Applied force, friction, gravity, and acceleration
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? "Pause" : "Simulate Motion"}</span>
          </button>
        </div>
      </div>

      {/* Main Physics Workspace */}
      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto canvas-grid">
        
        {/* Left: Free-Body Diagram Canvas */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Animated Motion & Vector Graphic Box */}
          <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden h-64 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold">Free-Body Diagram & Motion Track</span>
              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span>Pos: {Math.round(posX)}px</span>
                <span>•</span>
                <span className="text-amber-500 font-bold">Vel: {velocity.toFixed(1)} m/s</span>
              </div>
            </div>

            {/* SVG Visual Stage with Vectors */}
            <div className="relative w-full h-44 flex items-center">
              {/* Floor Surface */}
              <div className="absolute left-0 right-0 bottom-6 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              
              {/* Sliding Block */}
              <div
                style={{ left: `${posX}px` }}
                className="absolute bottom-7 w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30 flex flex-col items-center justify-center text-white font-bold text-xs border-2 border-white/40 transition-none select-none z-10"
              >
                <span>{mass} kg</span>
                <span className="text-[9px] opacity-80">Block</span>

                {/* Normal Force Vector (Upward) */}
                <button
                  onClick={() => handleTriggerExplanation("Normal Force", "F_N = mg", "The perpendicular contact force exerted by the surface balancing gravity.")}
                  style={{ height: `${Math.min(60, normalForce * 0.8)}px` }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 w-1.5 bg-blue-500 rounded-t flex flex-col items-center justify-start group"
                >
                  <span className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-blue-500 -mt-1.5" />
                  <span className="absolute -top-5 text-[9px] font-mono font-bold text-blue-500 whitespace-nowrap">
                    F_N={normalForce}N
                  </span>
                </button>

                {/* Gravity Vector (Downward) */}
                <button
                  onClick={() => handleTriggerExplanation("Gravity Force", "F_g = mg", "The downward gravitational force pulling mass towards Earth.")}
                  style={{ height: `${Math.min(60, gravityForce * 0.8)}px` }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 bg-purple-500 rounded-b flex flex-col items-center justify-end group"
                >
                  <span className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-purple-500 -mb-1.5" />
                  <span className="absolute -bottom-5 text-[9px] font-mono font-bold text-purple-500 whitespace-nowrap">
                    F_g={gravityForce}N
                  </span>
                </button>

                {/* Applied Force Vector (Rightward) */}
                <button
                  onClick={() => handleTriggerExplanation("Applied Force", "F_{applied}", "The external force applied to accelerate the mass.")}
                  style={{ width: `${Math.min(80, appliedForce * 0.9)}px` }}
                  className="absolute left-full top-1/2 -translate-y-1/2 h-1.5 bg-emerald-500 rounded-r flex items-center justify-end group"
                >
                  <span className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-emerald-500 -mr-1.5" />
                  <span className="absolute -right-2 -top-4 text-[9px] font-mono font-bold text-emerald-500 whitespace-nowrap">
                    F_app={appliedForce}N
                  </span>
                </button>

                {/* Friction Force Vector (Leftward) */}
                <button
                  onClick={() => handleTriggerExplanation("Friction Force", "f_k = \\mu F_N", "The resistive force opposing motion proportional to normal force.")}
                  style={{ width: `${Math.min(70, frictionForce * 1.5)}px` }}
                  className="absolute right-full top-1/2 -translate-y-1/2 h-1.5 bg-rose-500 rounded-l flex items-center justify-start group"
                >
                  <span className="w-0 h-0 border-y-4 border-y-transparent border-r-6 border-r-rose-500 -ml-1.5" />
                  <span className="absolute -left-2 -top-4 text-[9px] font-mono font-bold text-rose-500 whitespace-nowrap">
                    f_k={frictionForce}N
                  </span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center">
              Click any colored force vector arrow to inspect formula & physics law
            </div>
          </div>

          {/* Kinematic Output Metrics HUD */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/95 dark:bg-slate-950/95 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Net Force (F_net)</span>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                <MathRenderer text={`$${netForce}\\text{ N}$`} />
              </div>
            </div>

            <div className="p-3 bg-white/95 dark:bg-slate-950/95 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Acceleration (a)</span>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                <MathRenderer text={`$${acceleration}\\text{ m/s}^2$`} />
              </div>
            </div>

            <div className="p-3 bg-white/95 dark:bg-slate-950/95 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Friction Limit (f_max)</span>
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                <MathRenderer text={`$${maxStaticFriction}\\text{ N}$`} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Physics Sliders & Derivations */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b pb-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Interactive Physics Parameters</span>
            </div>

            {/* Mass Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Mass (<MathRenderer text="$m$" />):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{mass} kg</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Applied Force Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Applied Force (<MathRenderer text="$F_{\\text{applied}}$" />):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{appliedForce} N</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={appliedForce}
                onChange={(e) => setAppliedForce(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Friction Coeff Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Friction Coeff (<MathRenderer text="$\\mu$" />):</span>
                <span className="font-bold text-rose-500">{frictionCoeff}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={frictionCoeff}
                onChange={(e) => setFrictionCoeff(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* LaTeX Equations Breakdown Card */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-200 block">
              Newton's 2nd Law Equations:
            </span>
              <div><MathRenderer text={`$\\vec{F}_{\\text{net}} = F_{\\text{applied}} - f_k = ${appliedForce} - ${frictionForce} = ${netForce}\\text{ N}$`} /></div>
              <div><MathRenderer text={`$\\vec{a} = \\frac{\\vec{F}_{\\text{net}}}{m} = \\frac{${netForce}}{${mass}} = ${acceleration}\\text{ m/s}^2$`} /></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PhysicsVectorVisualizer;
