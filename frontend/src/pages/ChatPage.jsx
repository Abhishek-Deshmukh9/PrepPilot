import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  AlertTriangle,
  Loader2,
  Trash2,
  Bookmark
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import chatService from "../services/chatService";

const ChatPage = () => {
  const { activeDocument } = useDocuments();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const messagesEndRef = useRef(null);
  
  // Track unique session ID in localStorage, generate if missing
  const [sessionId] = useState(() => {
    let saved = localStorage.getItem("preppilot_chat_session");
    if (!saved) {
      saved = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("preppilot_chat_session", saved);
    }
    return saved;
  });

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatService.getHistory(sessionId);
        // Format histories into page messages array
        const formatted = [];
        history.forEach((h) => {
          formatted.push({ sender: "user", text: h.question });
          formatted.push({ 
            sender: "ai", 
            text: h.answer, 
            sources: h.sources 
          });
        });
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadHistory();
  }, [sessionId]);

  // Autoscroll chat pane
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    if (!activeDocument) {
      setErrorMsg("Please select an active document from the sidebar to chat.");
      return;
    }

    const question = inputText.trim();
    setInputText("");
    setErrorMsg("");
    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setIsLoading(true);

    try {
      const response = await chatService.query({
        sessionId,
        documentId: activeDocument.id,
        question
      });

      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: response.answer, 
          sources: response.sources 
        }
      ]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate AI response. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear this chat history?")) {
      try {
        await chatService.clearHistory(sessionId);
        setMessages([]);
      } catch (err) {
        setErrorMsg("Failed to clear history.");
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Session Context Panel */}
      <div className="glass-panel p-4 rounded-t-3xl border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-white/50">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-50 dark:bg-brand-950/40 p-2 rounded-xl text-brand-600 dark:text-brand-400">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold truncate max-w-md">
              {activeDocument ? `Chatting with: ${activeDocument.filename}` : "Select a document to begin"}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Context-grounded RAG query sessions</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-xl text-[11px] font-semibold border border-transparent hover:border-rose-200/30 transition-all"
            title="Clear Chat Logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        )}
      </div>

      {/* Chat Messages Pane */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/10 border-x border-slate-200/50 dark:border-slate-800/50 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md mx-auto">
            <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-full text-brand-600 dark:text-brand-400 border border-brand-100/50 dark:border-brand-900/30">
              <Sparkles className="h-6 w-6 animate-pulse-subtle" />
            </div>
            <h3 className="font-display text-md font-bold">Ask Anything About Your Notes</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Submit questions to scan the vector database. The system retrieves matched segments and cites source coordinates instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-4 shadow-sm border ${
                    msg.sender === "user"
                      ? "bg-brand-600 border-brand-500 text-white"
                      : "bg-white border-slate-200/80 dark:bg-slate-950 dark:border-slate-800/80 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  <p className="text-xs whitespace-pre-wrap leading-relaxed select-text">{msg.text}</p>
                  
                  {/* Citations and Sources Block */}
                  {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                        <Bookmark className="h-3 w-3 mr-1 text-brand-500" />
                        <span>Sources Referenced</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, sIdx) => (
                          <div 
                            key={sIdx}
                            className="group relative"
                          >
                            <span 
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-lg cursor-help hover:border-brand-400 hover:text-brand-500 transition-colors inline-block"
                            >
                              Page {src.page || "N/A"} ({Math.round(src.score * 100)}% match)
                            </span>
                            {/* Hover tooltip for snippet */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 bg-slate-900 text-slate-100 text-[10px] p-3 rounded-xl shadow-xl border border-slate-800 z-30 leading-relaxed font-sans select-none">
                              <p className="font-bold border-b border-slate-800 pb-1 mb-1.5 text-brand-400">Snippet Source:</p>
                              <p className="line-clamp-5 whitespace-pre-wrap">{src.text_snippet}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800/80 rounded-2xl p-4 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Scanning notes & generating response...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray Footer */}
      <form 
        onSubmit={handleSend}
        className="glass-panel p-4 rounded-b-3xl border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col bg-white/50"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeDocument ? "Type a question about your knowledge base..." : "Select a document to begin..."}
            disabled={!activeDocument || isLoading}
            className="flex-1 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-2xl shadow-lg shadow-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
        
        {errorMsg && (
          <div className="mt-2.5 flex items-center space-x-1 text-[11px] text-rose-500 font-semibold bg-rose-500/5 px-2.5 py-1 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatPage;
