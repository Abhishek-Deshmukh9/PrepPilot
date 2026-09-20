import React, { useState, useEffect, useCallback } from "react";
import { 
  Database,
  Cpu,
  Trash2,
  CheckCircle,
  Activity,
  RefreshCw,
  UserCheck,
  RotateCcw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Layers,
  Sparkles,
  Server
} from "lucide-react";
import { DEFAULT_API_BASE_URL, normalizeApiUrl } from "../services/api";
import systemService from "../services/systemService";
import { useLearnerProfile, ARCHETYPES } from "../contexts/LearnerProfileContext";
import { useDocuments } from "../contexts/DocumentContext";

const SettingsPage = () => {
  const { addToast } = useDocuments();
  const { profile, activeArchetypeId, switchArchetype } = useLearnerProfile();

  // Connection State
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem("preppilot_api_url") || DEFAULT_API_BASE_URL;
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null); // { ok: boolean, latencyMs: number, error?: string }

  // System Info State
  const [systemInfo, setSystemInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [infoError, setInfoError] = useState(null);

  // Fetch system info from live backend
  const loadSystemInfo = useCallback(async () => {
    setIsLoadingInfo(true);
    setInfoError(null);
    try {
      const data = await systemService.getSystemInfo();
      setSystemInfo(data);
    } catch (err) {
      console.warn("Could not load backend system info:", err);
      setInfoError(err.message || "Backend unreachable");
    } finally {
      setIsLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    loadSystemInfo();
  }, [loadSystemInfo]);

  // Test Connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setHealthStatus(null);
    try {
      const result = await systemService.checkHealth(apiUrl);
      setHealthStatus(result);
      if (result.ok) {
        addToast?.(`Connected to backend (${result.latencyMs}ms)`, "success");
        // Also refresh system info if connection succeeded
        loadSystemInfo();
      } else {
        addToast?.(`Connection failed: ${result.error}`, "error");
      }
    } catch (err) {
      const failure = { ok: false, latencyMs: 0, error: err.message };
      setHealthStatus(failure);
      addToast?.(`Connection failed: ${err.message}`, "error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save Configuration
  const handleSave = (e) => {
    e.preventDefault();
    const normalized = normalizeApiUrl(apiUrl);
    setApiUrl(normalized);
    localStorage.setItem("preppilot_api_url", normalized);
    addToast?.("API configuration saved successfully!", "success");
  };

  // Reset API URL to default
  const handleResetApiUrl = () => {
    localStorage.removeItem("preppilot_api_url");
    setApiUrl(DEFAULT_API_BASE_URL);
    setHealthStatus(null);
    addToast?.("API gateway reset to default URL.", "info");
  };

  // Clear Active Document & Cache
  const handleClearDocCache = () => {
    localStorage.removeItem("active_document");
    localStorage.removeItem("chat_session_id");
    addToast?.("Active document selection and session cache cleared.", "info");
  };

  // Danger Zone: Reset All PrepPilot Data
  const handleResetAllData = () => {
    if (
      window.confirm(
        "This will reset all PrepPilot settings, learner profile, and active document state to factory defaults.\n\nAre you sure you want to proceed?"
      )
    ) {
      // Clear only PrepPilot-owned application keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("preppilot_") ||
            key.startsWith("prep_") ||
            key === "active_document" ||
            key === "chat_session_id" ||
            key === "theme")
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      addToast?.("PrepPilot data reset. Reloading application...", "info");
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up pb-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage backend connection, live model architecture, learner profile, and system parameters.
        </p>
      </div>

      <div className="glass-panel border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-8 bg-slate-900/60 shadow-xl backdrop-blur-xl">
        
        {/* SECTION 1: API Connection Gateway */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Database className="h-4 w-4 mr-2 text-brand-500" />
              <span>Connection Gateway</span>
            </h3>
            {healthStatus && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1.5 ${
                  healthStatus.ok
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {healthStatus.ok ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span>Online ({healthStatus.latencyMs}ms)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>Disconnected</span>
                  </>
                )}
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Backend API URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
                className="w-full bg-slate-950/60 hover:bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition-all placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-500">
                Default: <code className="text-slate-400">{DEFAULT_API_BASE_URL}</code>. Automatically normalizes slashes and ensures standard <code>/api/v1</code> endpoint.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] flex items-center space-x-1.5"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Save Configuration</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-400" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-3.5 w-3.5 text-brand-400" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetApiUrl}
                className="text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-xl transition-colors flex items-center space-x-1"
                title="Restore default API URL"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset URL</span>
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: AI Architecture & Runtime Parameters */}
        <section className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Cpu className="h-4 w-4 mr-2 text-indigo-400" />
              <span>AI Architecture Parameters</span>
            </h3>
            <button
              type="button"
              onClick={loadSystemInfo}
              disabled={isLoadingInfo}
              className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center space-x-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingInfo ? "animate-spin" : ""}`} />
              <span>{isLoadingInfo ? "Refreshing..." : "Refresh Live Info"}</span>
            </button>
          </div>

          {infoError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-2 text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Could not fetch live backend parameters ({infoError}). Showing cached defaults.</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950/40 border border-slate-800/70 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">LLM Engine</p>
              <p className="text-slate-200 mt-1 font-semibold truncate font-mono text-[11px]">
                {systemInfo?.llm_engine || "gemini-3.5-flash"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 border border-slate-800/70 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Embedding Model</p>
              <p className="text-slate-200 mt-1 font-semibold truncate font-mono text-[11px]">
                {systemInfo?.embedding_model || "gemini-embedding-001"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 border border-slate-800/70 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Chunk Size</p>
              <p className="text-slate-200 mt-1 font-semibold">
                {systemInfo?.chunk_size ?? 500} tokens
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 border border-slate-800/70 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Chunk Overlap</p>
              <p className="text-slate-200 mt-1 font-semibold">
                {systemInfo?.chunk_overlap ?? 100} tokens
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 border border-slate-800/70 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Top-K Retrieval</p>
              <p className="text-slate-200 mt-1 font-semibold">
                {systemInfo?.top_k ?? 5} chunks
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 border border-slate-800/70 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Upload Limit</p>
              <p className="text-slate-200 mt-1 font-semibold">
                {systemInfo?.max_file_size_mb ?? 50} MB
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center space-x-1">
              <Server className="h-3 w-3" />
              <span>{systemInfo?.app_name || "PrepPilot AI"} v{systemInfo?.app_version || "1.0.0"}</span>
            </span>
            <span className="capitalize">
              Env: <strong className="text-slate-400 font-medium">{systemInfo?.environment || "development"}</strong>
            </span>
          </div>
        </section>

        {/* SECTION 3: Learner Persona & Tutor Style */}
        <section className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <UserCheck className="h-4 w-4 mr-2 text-cyan-400" />
              <span>Learner Persona & Tutor Style</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
              Active: {profile?.name || "Student A"}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select how the Socratic AI companion tailors explanations, visual canvas diagrams, and prerequisite scaffolding during chat sessions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(ARCHETYPES).map(([archId, arch]) => {
              const isSelected = activeArchetypeId === archId;
              return (
                <button
                  key={archId}
                  type="button"
                  onClick={() => {
                    switchArchetype(archId);
                    addToast?.(`Tutor style switched to ${arch.name} (${arch.badgeLabel})`, "success");
                  }}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? "bg-brand-500/15 border-brand-500/80 shadow-lg shadow-brand-500/10"
                      : "bg-slate-950/40 border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-slate-100 flex items-center space-x-1.5">
                      <span>{arch.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {arch.badgeLabel}
                      </span>
                    </span>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-brand-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {arch.tutorRationale}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: Danger Zone & Granular Resets */}
        <section className="pt-6 border-t border-slate-800/80 space-y-4">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center">
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Danger Zone & Reset Tools</span>
          </h3>
          <p className="text-xs text-slate-400">
            Manage local storage cache, document state, and system configurations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={handleResetApiUrl}
              className="p-3 rounded-2xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 text-slate-300 text-xs font-semibold flex flex-col items-start space-y-1 transition-all"
            >
              <span className="flex items-center space-x-1.5 text-slate-200">
                <RotateCcw className="h-3.5 w-3.5 text-brand-400" />
                <span>Reset API URL</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal text-left">
                Revert custom gateway URL back to default.
              </span>
            </button>

            <button
              type="button"
              onClick={handleClearDocCache}
              className="p-3 rounded-2xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 text-slate-300 text-xs font-semibold flex flex-col items-start space-y-1 transition-all"
            >
              <span className="flex items-center space-x-1.5 text-slate-200">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>Clear Doc State</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal text-left">
                Unselect active document and clear chat caches.
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetAllData}
              className="p-3 rounded-2xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/30 hover:border-rose-800/60 text-rose-300 text-xs font-semibold flex flex-col items-start space-y-1 transition-all"
            >
              <span className="flex items-center space-x-1.5 text-rose-300">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Reset All App Data</span>
              </span>
              <span className="text-[10px] text-rose-400/70 font-normal text-left">
                Factory reset all preferences and reload app.
              </span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
export { SettingsPage as Settings };
