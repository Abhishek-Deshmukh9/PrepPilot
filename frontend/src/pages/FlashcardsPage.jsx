import React, { useState, useEffect } from "react";
import { 
  Copy, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Layers,
  RotateCw
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";
import MarkdownRenderer from "../components/common/MarkdownRenderer";

const FlashcardsPage = () => {
  const { activeDocument } = useDocuments();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Card settings
  const [deckName, setDeckName] = useState("Key Terminology Deck");
  const [cardCount, setCardCount] = useState(15);

  // Deck states
  const [deckActive, setDeckActive] = useState(false);
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    setDeckActive(false);
    setCards([]);
    setCurrentIdx(0);
    setFlipped(false);
    setRatings({});
    setErrorMsg("");
  }, [activeDocument]);

  const handleStartDeck = async () => {
    if (!activeDocument) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await studyService.generateFlashcards(activeDocument.id, deckName, cardCount);
      if (data.flashcards && data.flashcards.length > 0) {
        setCards(data.flashcards);
        setDeckActive(true);
        setCurrentIdx(0);
        setFlipped(false);
        setRatings({});
      } else {
        throw new Error("No flashcards could be generated from this document.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate flashcards. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setFlipped(false);
      setTimeout(() => {
        setCurrentIdx((prev) => prev - 1);
      }, 150);
    }
  };

  const handleNext = () => {
    if (currentIdx < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
      }, 150);
    }
  };

  const handleRating = (difficulty) => {
    const activeCard = cards[currentIdx];
    setRatings((prev) => ({
      ...prev,
      [activeCard.id]: difficulty
    }));
    if (currentIdx < cards.length - 1) {
      handleNext();
    }
  };

  const handleFinishDeck = () => {
    setDeckActive(false);
    setCards([]);
  };

  if (!activeDocument) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 animate-slide-up">
        <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
          <Copy className="h-8 w-8 animate-pulse-subtle" />
        </div>
        <h3 className="font-display text-base font-bold text-slate-100">Select Study Document</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Choose a guide from the top navigation. PrepPilot creates interactive 3D flashcards with spaced repetition memory rating.
        </p>
      </div>
    );
  }

  // Active Deck View
  if (deckActive && cards.length > 0) {
    const activeCard = cards[currentIdx];
    const isRated = ratings[activeCard.id];
    
    return (
      <div className="max-w-md mx-auto space-y-6 animate-slide-up">
        {/* Progress & Deck Info */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span className="font-mono text-[11px]">DECK: <strong className="text-sky-400 font-sans">{deckName}</strong></span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            CARD {currentIdx + 1} OF {cards.length}
          </span>
        </div>

        {/* 3D Flipping Card Container */}
        <div 
          onClick={handleFlip}
          className="h-84 w-full relative cursor-pointer group select-none"
          style={{ perspective: "1000px" }}
        >
          <div 
            className="w-full h-full rounded-3xl transition-transform duration-500 relative"
            style={{ 
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0 bg-[#0c1017] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all group-hover:border-sky-500/30"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest font-mono flex items-center justify-between">
                <span>CONCEPT / QUESTION</span>
                <span className="text-slate-500 font-sans font-normal flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Click to flip
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center px-2">
                <div className="font-display text-lg md:text-xl font-bold leading-relaxed text-slate-100 select-text">
                  <MarkdownRenderer content={activeCard.front} compact />
                </div>
              </div>
              <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest text-center">
                PREPPILOT STUDY DECK
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 bg-[#0c1017] border border-sky-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono flex justify-between">
                <span>DEFINITION / EXPLANATION</span>
                <span className="text-slate-500 font-sans font-normal flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Click to flip
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center overflow-y-auto my-3 pr-1">
                <div className="text-xs md:text-sm text-slate-200 leading-relaxed select-text">
                  <MarkdownRenderer content={activeCard.back} compact />
                </div>
              </div>
              <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest text-center">
                PREPPILOT STUDY DECK
              </div>
            </div>
          </div>
        </div>

        {/* Rating Row (renders when flipped) */}
        {flipped && (
          <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] shadow-lg flex flex-col items-center justify-center space-y-2.5 animate-slide-up">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
              RATE RECALL DIFFICULTY:
            </span>
            <div className="flex space-x-2.5">
              {[
                { id: "easy", label: "Easy (+1)", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" },
                { id: "medium", label: "Medium (0)", color: "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20" },
                { id: "hard", label: "Hard (Retry)", color: "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRating(item.id);
                  }}
                  className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${item.color} ${
                    isRated === item.id ? "ring-2 ring-sky-400" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleFinishDeck}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Deck</span>
          </button>

          <div className="flex space-x-2.5">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            {currentIdx === cards.length - 1 ? (
              <button
                onClick={handleFinishDeck}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Finish Review</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-slate-300 transition-all"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-Deck Configuration Screen
  return (
    <div className="max-w-md mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">Study Flashcards</h1>
        <p className="text-xs text-slate-400 mt-1">Generate interactive memory retention decks from your active study guide.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
        {/* Deck name input */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deck Name</label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-sky-500/50 focus:bg-[#0c1017] transition-all"
          />
        </div>

        {/* Card Quantity input */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Quantity</label>
          <input
            type="number"
            value={cardCount}
            onChange={(e) => setCardCount(e.target.value)}
            className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-sky-500/50 focus:bg-[#0c1017] transition-all font-mono"
            min="5"
            max="50"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 text-xs text-rose-400 font-semibold bg-rose-500/10 px-4 py-3 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleStartDeck}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating flashcard cards...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Revision Deck</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FlashcardsPage;
