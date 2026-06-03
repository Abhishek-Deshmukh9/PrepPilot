import React from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Sparkles, BookOpen, ChevronDown } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDocuments } from "../../contexts/DocumentContext";

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { documents, activeDocument, selectDocument } = useDocuments();

  const handleDocChange = (e) => {
    const docId = e.target.value;
    if (!docId) {
      selectDocument(null);
      return;
    }
    const doc = documents.find((d) => d.id === docId);
    if (doc) selectDocument(doc);
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2.5 group">
        <div className="bg-gradient-to-tr from-brand-600 to-indigo-500 p-2 rounded-xl text-white shadow-md shadow-brand-500/10 group-hover:scale-105 transition-all duration-300">
          <Sparkles className="h-4.5 w-4.5 animate-pulse-subtle" />
        </div>
        <div>
          <span className="font-display text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            PrepPilot <span className="text-brand-500">AI</span>
          </span>
        </div>
      </Link>

      {/* Center / Document Selection Dropdown */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/30 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400">
          <BookOpen className="h-3.5 w-3.5 text-brand-500" />
          <span className="font-medium">Studying:</span>
          <div className="relative flex items-center">
            <select
              value={activeDocument?.id || ""}
              onChange={handleDocChange}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 pr-5 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-white dark:bg-slate-950">Select document...</option>
              {documents.filter(d => d.status === "ready").map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-white dark:bg-slate-950">
                  {doc.filename.length > 25 ? `${doc.filename.substring(0, 25)}...` : doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-0 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* Right / Utility Actions */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/40 text-slate-600 dark:text-slate-400 transition-all duration-200"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
        </button>

        {/* Premium Profile Badge */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center font-display text-white text-xs font-bold shadow-md shadow-brand-500/10 border border-white/20">
            PA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pilot Assistant</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Study Mode Active</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
