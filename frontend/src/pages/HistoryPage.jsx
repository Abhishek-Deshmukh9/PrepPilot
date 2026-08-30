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
import MarkdownRenderer from "../components/common/MarkdownRenderer";

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
    <div className="space-y-6 animate-slide-up pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">Study Session History</h1>
          <p className="text-xs text-slate-400 mt-1">Review your historical questions, generated answers, and citations.</p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 transition-all self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Session Logs</span>
          </button>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-3xl space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <p className="text-xs font-semibold text-slate-200">Fetching session records...</p>
          </div>
        )}

        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-4 max-w-sm mx-auto">
            <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
              <History className="h-7 w-7 animate-pulse-subtle" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-100">No chat history logged</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start asking questions in the <a href="/chat" className="text-sky-400 hover:underline">Chat Module</a>. Once study questions are submitted, answers and citations are archived here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {historyItems.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="p-5 rounded-2xl glass-card space-y-3.5"
              >
                <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-mono border-b border-white/[0.06] pb-2.5 gap-2">
                  <span className="flex items-center text-slate-400">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-sky-400" /> 
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="flex items-center bg-white/[0.04] text-sky-300 px-2.5 py-0.5 rounded-full border border-white/[0.06] text-[9px] font-bold">
                    <BookMarked className="h-3 w-3 mr-1.5 text-sky-400" /> 
                    {getDocName(item.document_id)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-400">Question:</p>
                  <div className="text-xs font-bold text-slate-100 select-text">
                    <MarkdownRenderer content={item.question} compact />
                  </div>
                </div>
                
                <div className="space-y-1 pt-1">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">Answer:</p>
                  <div className="text-xs text-slate-300 leading-relaxed select-text">
                    <MarkdownRenderer content={item.answer} />
                  </div>
                </div>

                {item.sources && item.sources.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2 border-t border-white/[0.04]">
                    {item.sources.map((src, sIdx) => (
                      <span 
                        key={sIdx}
                        className="px-2.5 py-1 bg-black/30 text-slate-400 text-[9px] font-mono rounded-lg border border-white/[0.06]"
                        title={src.text_snippet}
                      >
                        Ref: Page {src.page || "N/A"}
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
