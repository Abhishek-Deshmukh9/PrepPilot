import React, { useState, useEffect } from "react";
import { 
  Copy, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";

const FlashcardsPage = () => {
  const { activeDocument } = useDocuments();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Card settings
  const [deckName, setDeckName] = useState("Key Terms");
  const [cardCount, setCardCount] = useState(20);

  // Deck states
  const [deckActive, setDeckActive] = useState(false);
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState({}); // { cardId: 'easy' | 'medium' | 'hard' }

  // Reset states on active document swap
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
      // Brief delay to allow card to unflip before shifting content
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
    // Auto advance if there is a next card
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
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-full text-amber-500 border border-amber-100/50 dark:border-amber-900/30">
          <Copy className="h-6 w-6" />
        </div>
        <h3 className="font-display text-md font-bold">Select Document for Flashcards</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          Open the sidebar and pick a study guide. Once active, this tool compiles terminology cards for active revision.
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
        {/* Card Counter Header */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Deck: <strong className="text-slate-700 dark:text-slate-300">{deckName}</strong></span>
          <span>Card {currentIdx + 1} of {cards.length}</span>
        </div>

        {/* 3D Flipping Card Container */}
        <div 
          onClick={handleFlip}
          className="h-80 w-full relative cursor-pointer group"
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
              className="absolute inset-0 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between shadow-md"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-[10px] font-extrabold text-brand-500 uppercase tracking-widest font-display flex items-center justify-between">
                <span>Concept / Term</span>
                <span className="text-slate-300 dark:text-slate-700">Click to flip</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center">
                <h3 className="font-display text-lg md:text-xl font-bold leading-relaxed text-slate-800 dark:text-slate-100 select-text">
                  {activeCard.front}
                </h3>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
                PrepPilot Study Deck
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 bg-white dark:bg-slate-950 border border-brand-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-lg"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="text-[10px] font-extrabold text-brand-500 uppercase tracking-widest font-display flex justify-between">
                <span>Answer / Definition</span>
                <span className="text-slate-300 dark:text-slate-700">Click to flip</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center overflow-y-auto my-4 pr-1">
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed select-text font-medium">
                  {activeCard.back}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
                PrepPilot Study Deck
              </div>
            </div>
          </div>
        </div>

        {/* Rating Row (renders when flipped) */}
        {flipped && (
          <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col items-center justify-center space-y-2 bg-white/70 animate-slide-up">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate memory retention:</span>
            <div className="flex space-x-2">
              {["easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRating(diff);
                  }}
                  className={`px-4 py-1.5 rounded-xl border text-[10px] font-bold capitalize transition-all ${
                    isRated === diff
                      ? "border-brand-500 bg-brand-50/20 text-brand-600 dark:text-brand-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleFinishDeck}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reshuffle Deck</span>
          </button>

          <div className="flex space-x-2.5">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
            
            {currentIdx === cards.length - 1 ? (
              <button
                onClick={handleFinishDeck}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Finish Deck</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-Deck Configuration Screen
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Study Flashcards</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate terminology cards for active spaced repetition memory practice.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5 bg-white/50">
        {/* Deck name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deck Name</label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="w-full bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
          />
        </div>

        {/* Card Quantity input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Card Quantity</label>
          <input
            type="number"
            value={cardCount}
            onChange={(e) => setCardCount(e.target.value)}
            className="w-full bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
            min="5"
            max="50"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2.5 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleStartDeck}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-3.5 rounded-xl shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating flashcards deck...</span>
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
