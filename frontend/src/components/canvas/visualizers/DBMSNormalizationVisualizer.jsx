import React, { useState } from "react";
import { 
  Database, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Key, 
  Table, 
  Split
} from "lucide-react";
import { MathRenderer } from "../../common/MathRenderer";

export const DBMSNormalizationVisualizer = ({
  onComponentClick = null
}) => {
  const [currentStage, setCurrentStage] = useState("1NF"); // 'UNF' | '1NF' | '2NF' | '3NF'

  const handleTriggerExplanation = (componentName, data) => {
    if (onComponentClick) {
      onComponentClick({
        component: `DBMS Normalization: ${componentName}`,
        details: data
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Relational Database Normalization Pipeline</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                UNF → 1NF → 2NF → 3NF
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Interactive schema transformation and functional dependency decomposition
            </p>
          </div>
        </div>

        {/* Stage Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {["UNF", "1NF", "2NF", "3NF"].map((stage) => (
            <button
              key={stage}
              onClick={() => setCurrentStage(stage)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currentStage === stage
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Main Transformation Canvas */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 canvas-grid">
        
        {/* Stage Rule Alert Box */}
        <div className="p-4 bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              {currentStage === "UNF" && "Unnormalized Form (UNF): Contains non-atomic values and repeating groups."}
              {currentStage === "1NF" && "1NF (First Normal Form): Eliminate repeating groups; ensure all cell values are atomic."}
              {currentStage === "2NF" && "2NF (Second Normal Form): In 1NF + Eliminate Partial Functional Dependencies on composite primary keys."}
              {currentStage === "3NF" && "3NF (Third Normal Form): In 2NF + Eliminate Transitive Dependencies (non-key → non-key)."}
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              {currentStage === "UNF" && "Multi-valued fields like multiple enrolled courses in a single cell violate relational atomicity."}
              {currentStage === "1NF" && "Every attribute contains atomic values. Composite primary key is (StudentID, CourseID). However, CourseName depends only on CourseID (Partial Dependency)."}
              {currentStage === "2NF" && "Decomposed into Student_Courses and Courses tables. Eliminates partial dependency, but InstructorPhone depends on InstructorID (Transitive Dependency)."}
              {currentStage === "3NF" && "Decomposed into three lossless tables: Student_Courses, Courses, and Instructors. Complete Boyce-Codd compliant 3NF schema."}
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Tables Display */}
        {currentStage === "UNF" && (
          <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-rose-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Unnormalized Student Records (UNF)</span>
              </span>
              <button
                onClick={() => handleTriggerExplanation("UNF Anomalies", "Multi-valued attributes violate 1NF atomicity rule.")}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Explain Anomalies 💬
              </button>
            </div>

            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-b border-rose-200 dark:border-rose-800">
                  <th className="p-2.5">StudentID</th>
                  <th className="p-2.5">StudentName</th>
                  <th className="p-2.5 bg-rose-200/50 dark:bg-rose-900/50">Courses (Multi-valued!)</th>
                  <th className="p-2.5">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-2.5 font-bold">S101</td>
                  <td className="p-2.5">Alice Smith</td>
                  <td className="p-2.5 text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20">CS101, MATH200, PHYS150</td>
                  <td className="p-2.5">Dr. Turing</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">S102</td>
                  <td className="p-2.5">Bob Johnson</td>
                  <td className="p-2.5 text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20">CS101, CS204</td>
                  <td className="p-2.5">Dr. Knuth</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {currentStage === "1NF" && (
          <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-amber-500">
                <Key className="w-4 h-4" />
                <span>1NF Table: Atomic Cells, Composite Key: (StudentID, CourseID)</span>
              </span>
              <button
                onClick={() => handleTriggerExplanation("1NF Partial Dependency", "CourseName depends only on CourseID, violating 2NF.")}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Explain Partial Dependency 💬
              </button>
            </div>

            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800">
                  <th className="p-2.5 bg-amber-100/70 dark:bg-amber-900/60 font-bold">🔑 StudentID</th>
                  <th className="p-2.5 bg-amber-100/70 dark:bg-amber-900/60 font-bold">🔑 CourseID</th>
                  <th className="p-2.5">StudentName</th>
                  <th className="p-2.5 bg-rose-100/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold">CourseName (Partial Dep!)</th>
                  <th className="p-2.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="p-2.5">S101</td><td className="p-2.5 font-bold">CS101</td><td className="p-2.5">Alice</td><td className="p-2.5 text-rose-600">Intro to CS</td><td className="p-2.5">A</td></tr>
                <tr><td className="p-2.5">S101</td><td className="p-2.5 font-bold">MATH200</td><td className="p-2.5">Alice</td><td className="p-2.5 text-rose-600">Linear Algebra</td><td className="p-2.5">A-</td></tr>
                <tr><td className="p-2.5">S102</td><td className="p-2.5 font-bold">CS101</td><td className="p-2.5">Bob</td><td className="p-2.5 text-rose-600">Intro to CS</td><td className="p-2.5">B+</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {currentStage === "2NF" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block border-b pb-1.5">
                Table 1: Student_Enrollments
              </span>
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-[11px]">
                    <th className="p-2">🔑 StudentID</th>
                    <th className="p-2">🔑 CourseID</th>
                    <th className="p-2">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  <tr><td className="p-2">S101</td><td className="p-2">CS101</td><td className="p-2">A</td></tr>
                  <tr><td className="p-2">S101</td><td className="p-2">MATH200</td><td className="p-2">A-</td></tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block border-b pb-1.5">
                Table 2: Courses (Transitive Dep: InstPhone)
              </span>
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-950/40 text-[11px]">
                    <th className="p-2">🔑 CourseID</th>
                    <th className="p-2">CourseName</th>
                    <th className="p-2">InstructorID</th>
                    <th className="p-2 text-rose-500">InstPhone (Transitive!)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  <tr><td className="p-2">CS101</td><td className="p-2">Intro to CS</td><td className="p-2">I01</td><td className="p-2 text-rose-500">555-0100</td></tr>
                  <tr><td className="p-2">MATH200</td><td className="p-2">Linear Algebra</td><td className="p-2">I02</td><td className="p-2 text-rose-500">555-0200</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentStage === "3NF" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>3NF Complete Decomposition: Lossless, Redundancy-Free Schema</span>
              </span>
              <button
                onClick={() => handleTriggerExplanation("3NF Victory", "All non-prime attributes depend only on the primary key, directly and non-transitively.")}
                className="text-[10px] hover:underline"
              >
                Explain 3NF Benefits 💬
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 block font-mono">1. Enrollments</span>
                <p className="text-[10px] font-mono text-slate-500">(<u>StudentID</u>, <u>CourseID</u>, Grade)</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 block font-mono">2. Courses</span>
                <p className="text-[10px] font-mono text-slate-500">(<u>CourseID</u>, CourseName, InstructorID)</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block font-mono">3. Instructors</span>
                <p className="text-[10px] font-mono text-slate-500">(<u>InstructorID</u>, InstructorName, Phone)</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DBMSNormalizationVisualizer;
