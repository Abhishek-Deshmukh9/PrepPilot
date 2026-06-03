import React, { useState } from "react";
import { 
  Settings, 
  Sparkles, 
  HelpCircle, 
  Database,
  Cpu,
  Trash2,
  CheckCircle
} from "lucide-react";

const SettingsPage = () => {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem("preppilot_api_url") || "http://localhost:8000/api/v1";
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("preppilot_api_url", apiUrl);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleResetApp = () => {
    if (window.confirm("This will clear your local active document state and local cache settings. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage connections, configuration preferences, and system parameters.</p>
      </div>

      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 space-y-6 bg-white/50">
        
        {/* API connection form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
            <Database className="h-4 w-4 mr-1.5 text-brand-500" />
            <span>Connection Gateway</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Backend API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:scale-[1.02]"
            >
              Save Configuration
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-500 font-semibold flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Settings saved!
              </span>
            )}
          </div>
        </form>

        {/* Model parameters read-only */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
            <Cpu className="h-4 w-4 mr-1.5 text-indigo-500" />
            <span>AI Architecture Parameters</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">LLM Engine</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-semibold">Gemini 2.5 Flash</p>
            </div>
            <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Embeddings model</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-semibold">all-MiniLM-L6-v2</p>
            </div>
            <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Chunk size</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-semibold">500 tokens</p>
            </div>
            <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Chunk overlap</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-semibold">100 tokens</p>
            </div>
          </div>
        </div>

        {/* Clear memory settings */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center text-rose-500">
            <Trash2 className="h-4 w-4 mr-1.5" />
            <span>Danger Zone</span>
          </h3>
          <p className="text-[11px] text-slate-400">Reset local browser caches and active study indicators. This does not delete backend SQLite documents.</p>
          <button
            onClick={handleResetApp}
            className="flex items-center space-x-1 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200/30 transition-all"
          >
            <span>Reset Local Preferences</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
export { SettingsPage as Settings };
