import React, { useState, useEffect } from "react";
import { 
  History, 
  Trash2, 
  Loader2, 
  MessageSquare, 
  Calendar, 
  ChevronRight,
  BookMarked
} from "lucide-react";
import chatService from "../services/chatService";
import { useDocuments } from "../contexts/DocumentContext";

const HistoryPage = () => {
  const { documents } = useDocuments();
  const [loading, setLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const sessionId = localStorage.getItem("preppilot_chat_session") || "";

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await chatService.getHistory(sessionId);
        setHistoryItems(data);
      } catch (err) {
        setErrorMsg("Failed to load history items.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to delete all historical logs for this session?")) {
      try {
        await chatService.clearHistory(sessionId);
        setHistoryItems([]);
      } catch (err) {
        alert("Failed to clear logs.");
      }
    }
  };

  const getDocName = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    return doc ? doc.filename : "Global Study Session";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Chat History</h1>
          <p className="text-slate-500 dark:text-slate-400">Review your past study chat history logs and retrieve key answer citations.</p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold border border-rose-200/20 dark:border-rose-900/30 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Session Logs</span>
          </button>
        )}
      </div>

      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 bg-white/50 min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm z-10 rounded-3xl">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Fetching session records...</p>
          </div>
        )}

        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-4 max-w-sm mx-auto">
            <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-full text-brand-600 dark:text-brand-400">
              <History className="h-6 w-6 animate-pulse-subtle" />
            </div>
            <h3 className="font-display text-sm font-bold">No chat history logged</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Start querying documents in the <a href="/chat" className="text-brand-500 hover:underline">Chat Module</a>. Once study questions are submitted, answers are archived here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {historyItems.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="p-5 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white dark:bg-slate-950 space-y-3.5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-50 dark:border-slate-900 pb-2 gap-2">
                  <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-brand-500" /> {new Date(item.timestamp).toLocaleString()}</span>
                  <span className="flex items-center bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md text-[9px]"><BookMarked className="h-3 w-3 mr-1 text-indigo-500" /> {getDocName(item.document_id)}</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Question:</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 select-text">{item.question}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Answer:</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap select-text">{item.answer}</p>
                </div>

                {item.sources && item.sources.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {item.sources.map((src, sIdx) => (
                      <span 
                        key={sIdx}
                        className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-400 text-[9px] font-semibold rounded-md border border-slate-100 dark:border-slate-800"
                        title={src.text_snippet}
                      >
                        Source Ref: Page {src.page || "N/A"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
