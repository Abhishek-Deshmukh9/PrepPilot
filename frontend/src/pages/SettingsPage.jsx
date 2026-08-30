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
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up pb-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage API connection endpoints, model runtime parameters, and local data.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* API connection form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center">
            <Database className="h-3.5 w-3.5 mr-1.5" />
            <span>CONNECTION GATEWAY</span>
          </h3>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backend API Endpoint</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-sky-500/50 focus:bg-[#0c1017] transition-all font-mono"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
            >
              Save Configuration
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Settings saved!
              </span>
            )}
          </div>
        </form>

        {/* Model parameters read-only */}
        <div className="pt-6 border-t border-white/[0.06] space-y-4">
          <h3 className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center">
            <Cpu className="h-3.5 w-3.5 mr-1.5" />
            <span>AI RUNTIME ARCHITECTURE</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs font-medium">
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">LLM Engine</p>
              <p className="text-slate-200 mt-1 font-semibold">Gemini 3.5 Flash</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">Cloud Embeddings</p>
              <p className="text-slate-200 mt-1 font-semibold">gemini-embedding-001</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">Vector Database</p>
              <p className="text-slate-200 mt-1 font-semibold">ChromaDB (Local)</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">Vector Dimension</p>
              <p className="text-slate-200 mt-1 font-semibold">3072 dims</p>
            </div>
          </div>
        </div>

        {/* Clear memory settings */}
        <div className="pt-6 border-t border-white/[0.06] space-y-3">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest flex items-center text-rose-400">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span>LOCAL PREFERENCES CACHE</span>
          </h3>
          <p className="text-xs text-slate-400">Reset local browser session state and stored active guide selections. This will not delete backend vector embeddings or documents.</p>
          <button
            onClick={handleResetApp}
            className="flex items-center space-x-1.5 px-4 py-2 hover:bg-rose-500/10 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/20 transition-all"
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
