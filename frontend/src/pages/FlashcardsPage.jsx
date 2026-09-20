import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Copy, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Flame,
  Clock,
  Check,
  Filter,
  Play,
  Layers,
  HelpCircle,
  BarChart3,
  Award
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";
import MarkdownRenderer from "../components/common/MarkdownRenderer";

const FlashcardsPage = () => {
  const { activeDocument, addToast } = useDocuments();
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Generator Form Config
  const [deckName, setDeckName] = useState("Key Terms & Concepts");
  const [cardCount, setCardCount] = useState(20);
  const [showGeneratorForm, setShowGeneratorForm] = useState(false);

  // Deck Data (Master copy from SQLite backend)
  const [cards, setCards] = useState([]);
  const [deckActive, setDeckActive] = useState(false);
  const [isDeckFinished, setIsDeckFinished] = useState(false);

  // Study Session Navigation & State
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'hard' | 'unreviewed'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Helper: LocalStorage cache key
  const getCacheKey = (docId) => `preppilot_card_ratings_${docId}`;

  // Fetch existing cards for active document
  const loadExistingFlashcards = useCallback(async (docId) => {
    if (!docId) return;
    setIsFetchingExisting(true);
    setErrorMsg("");
    try {
      const data = await studyService.getFlashcards(docId);
      if (data && Array.isArray(data) && data.length > 0) {
        // Backend SQLite is source of truth
        setCards(data);
        // Sync local cache
        const ratingMap = {};
        data.forEach((c) => {
          ratingMap[c.id] = c.difficulty || "unreviewed";
        });
        localStorage.setItem(getCacheKey(docId), JSON.stringify(ratingMap));
      } else {
        // Check offline/local fallback if backend returned empty
        const savedCache = localStorage.getItem(getCacheKey(docId));
        if (savedCache) {
          try {
            const parsed = JSON.parse(savedCache);
            // Only keep if we have card references
          } catch (e) {}
        }
        setCards([]);
      }
    } catch (err) {
      console.warn("Could not fetch existing flashcards from backend:", err);
      // Offline fallback: try to load cached ratings if any
      setCards([]);
    } finally {
      setIsFetchingExisting(false);
    }
  }, []);

  // Sync on active document change
  useEffect(() => {
    setDeckActive(false);
    setIsDeckFinished(false);
    setCurrentIdx(0);
    setFlipped(false);
    setFilterMode("all");
    setShowGeneratorForm(false);
    setErrorMsg("");

    if (activeDocument) {
      loadExistingFlashcards(activeDocument.id);
    } else {
      setCards([]);
    }
  }, [activeDocument, loadExistingFlashcards]);

  // Derived Statistics (Source of Truth = cards)
  const stats = useMemo(() => {
    const total = cards.length;
    let easy = 0;
    let medium = 0;
    let hard = 0;
    let unreviewed = 0;

    cards.forEach((c) => {
      const diff = c.difficulty || "unreviewed";
      if (diff === "easy") easy++;
      else if (diff === "medium") medium++;
      else if (diff === "hard") hard++;
      else unreviewed++;
    });

    const masteredPercent = total > 0 ? Math.round((easy / total) * 100) : 0;

    return { total, easy, medium, hard, unreviewed, masteredPercent };
  }, [cards]);

  // Filtered Cards Queue
  const filteredCards = useMemo(() => {
    if (filterMode === "hard") {
      return cards.filter((c) => (c.difficulty || "unreviewed") === "hard");
    }
    if (filterMode === "unreviewed") {
      return cards.filter((c) => (c.difficulty || "unreviewed") === "unreviewed");
    }
    return cards;
  }, [cards, filterMode]);

  // Safe active card reference
  const currentCard = filteredCards[currentIdx] || null;

  // Handler: Start or Resume Deck
  const handleStartReview = (filter = "all") => {
    setFilterMode(filter);
    setCurrentIdx(0);
    setFlipped(false);
    setIsDeckFinished(false);
    setDeckActive(true);
  };

  // Handler: Generate New Deck (Explicit user action)
  const handleGenerateNewDeck = async (e) => {
    e?.preventDefault();
    if (!activeDocument) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await studyService.generateFlashcards(activeDocument.id, deckName, cardCount);
      if (data.flashcards && data.flashcards.length > 0) {
        setCards(data.flashcards);
        setShowGeneratorForm(false);
        setFilterMode("all");
        setCurrentIdx(0);
        setFlipped(false);
        setIsDeckFinished(false);
        setDeckActive(true);
        addToast?.(`Generated ${data.flashcards.length} flashcards!`, "success");
      } else {
        throw new Error("No flashcards could be generated from this document.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate flashcards. Please try again.");
      addToast?.(err.message || "Flashcard generation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Flip Card
  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  // Handler: Next Card
  const handleNext = () => {
    if (currentIdx < filteredCards.length - 1) {
      setFlipped(false);
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
      }, 150);
    } else {
      setIsDeckFinished(true);
    }
  };

  // Handler: Prev Card
  const handlePrev = () => {
    if (currentIdx > 0) {
      setFlipped(false);
      setTimeout(() => {
        setCurrentIdx((prev) => prev - 1);
      }, 150);
    }
  };

  // Handler: Rate Flashcard (Optimistic with Rollback)
  const handleRating = async (difficulty) => {
    if (!currentCard) return;

    const cardId = currentCard.id;
    const prevDifficulty = currentCard.difficulty || "unreviewed";

    // 1. Optimistic UI update
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, difficulty } : c))
    );

    // 2. Persist to backend SQLite
    try {
      await studyService.updateFlashcardRating(cardId, difficulty);
      // Sync local cache on success
      if (activeDocument) {
        const cacheKey = getCacheKey(activeDocument.id);
        const existingCache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
        existingCache[cardId] = difficulty;
        localStorage.setItem(cacheKey, JSON.stringify(existingCache));
      }
    } catch (err) {
      console.error("Failed to persist rating to backend:", err);
      // 3. Rollback on failure
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, difficulty: prevDifficulty } : c))
      );
      addToast?.(
        `Failed to save rating: ${err.message || "Network error"}. Rolled back.`,
        "error"
      );
    }

    // Auto-advance
    if (currentIdx < filteredCards.length - 1) {
      handleNext();
    } else {
      setIsDeckFinished(true);
    }
  };

  // Keyboard Navigation Support
  useEffect(() => {
    if (!deckActive || isDeckFinished || !currentCard) return;

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (flipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRating("hard");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRating("medium");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRating("easy");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deckActive, isDeckFinished, currentCard, flipped, currentIdx, filteredCards.length]);

  // NO ACTIVE DOCUMENT
  if (!activeDocument) {
    return (
      <div className="h-[65vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 animate-fade-in">
        <div className="bg-brand-500/10 p-5 rounded-3xl text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/5">
          <Copy className="h-8 w-8" />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-100">Select Document for Flashcards</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          Pick a document from the top bar or sidebar. Once selected, you can review existing flashcard decks or generate a new set tailored to your document.
        </p>
      </div>
    );
  }

  // LOADING STATE
  if (isFetchingExisting) {
    return (
      <div className="h-[65vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
        <p className="text-xs font-semibold text-slate-400">Loading flashcards from storage...</p>
      </div>
    );
  }

  // ACTIVE DECK STUDY VIEW
  if (deckActive && !isDeckFinished && filteredCards.length > 0) {
    const card = currentCard;
    const currentRating = card?.difficulty || "unreviewed";

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-slide-up pb-12">
        {/* Top Header & Mastery Summary */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-lg backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-display text-xs font-bold text-slate-200 truncate max-w-[200px]">
                {card?.deck_name || "Study Deck"}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                Card {currentIdx + 1} of {filteredCards.length}
              </span>
            </div>

            <button
              onClick={() => setDeckActive(false)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Exit Deck</span>
            </button>
          </div>

          {/* Mastery Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
              <span className="flex items-center space-x-1">
                <Award className="h-3 w-3 text-emerald-400" />
                <span>Mastery Progress</span>
              </span>
              <span className="text-emerald-400 font-bold">{stats.masteredPercent}% Mastered</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${(stats.easy / (stats.total || 1)) * 100}%` }} 
                className="bg-emerald-500 transition-all duration-300"
                title={`${stats.easy} Easy (Mastered)`}
              />
              <div 
                style={{ width: `${(stats.medium / (stats.total || 1)) * 100}%` }} 
                className="bg-amber-500 transition-all duration-300"
                title={`${stats.medium} Medium`}
              />
              <div 
                style={{ width: `${(stats.hard / (stats.total || 1)) * 100}%` }} 
                className="bg-rose-500 transition-all duration-300"
                title={`${stats.hard} Hard`}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleStartReview("all")}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                  filterMode === "all"
                    ? "bg-slate-800 text-slate-100 border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => handleStartReview("hard")}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all flex items-center space-x-1 ${
                  filterMode === "hard"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-slate-400 hover:text-rose-300"
                }`}
              >
                <Flame className="h-3 w-3 text-rose-400" />
                <span>Hard ({stats.hard})</span>
              </button>
              <button
                onClick={() => handleStartReview("unreviewed")}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all flex items-center space-x-1 ${
                  filterMode === "unreviewed"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-cyan-300"
                }`}
              >
                <HelpCircle className="h-3 w-3 text-cyan-400" />
                <span>Unreviewed ({stats.unreviewed})</span>
              </button>
            </div>

            {/* Current card rating indicator */}
            {currentRating !== "unreviewed" && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                currentRating === "easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : currentRating === "medium"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}>
                Rated: {currentRating}
              </span>
            )}
          </div>
        </div>

        {/* 3D Flipping Card Container */}
        <div 
          onClick={handleFlip}
          className="h-80 w-full relative cursor-pointer group select-none"
          style={{ perspective: "1000px" }}
        >
          <div 
            className="w-full h-full rounded-3xl transition-transform duration-500 relative"
            style={{ 
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* Front Side (Concept / Question) */}
            <div 
              className="absolute inset-0 bg-slate-950 border border-slate-800 group-hover:border-slate-700 rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-[10px] font-extrabold text-brand-400 uppercase tracking-widest font-display flex items-center justify-between">
                <span>Concept / Term</span>
                <span className="text-slate-600 font-normal">Click or Space to flip</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center overflow-y-auto my-3 pr-1">
                <div className="font-display text-lg md:text-xl font-bold leading-relaxed text-slate-100 select-text">
                  <MarkdownRenderer content={card.front} compact />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Front side</span>
                <span className="italic">Flip to reveal definition & rate</span>
              </div>
            </div>

            {/* Back Side (Answer / Definition) */}
            <div 
              className="absolute inset-0 bg-slate-950 border border-brand-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="text-[10px] font-extrabold text-brand-400 uppercase tracking-widest font-display flex justify-between items-center">
                <span>Answer / Definition</span>
                <span className="text-slate-600 font-normal">Click or Space to flip back</span>
              </div>

              <div className="flex-1 flex items-center justify-center text-center overflow-y-auto my-3 pr-1">
                <div className="text-sm md:text-base text-slate-200 leading-relaxed select-text font-normal">
                  <MarkdownRenderer content={card.back} compact />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Back side</span>
                <span className="text-brand-400 font-medium">Rate below to record retention</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Controls (Active when flipped or can be used anytime on card) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg bg-slate-900/60 flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-between w-full px-1 text-[11px]">
            <span className="text-slate-400 font-medium">Rate your retention:</span>
            <span className="text-slate-500 text-[10px] hidden sm:inline">Shortcuts: [1] Hard &bull; [2] Med &bull; [3] Easy</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full">
            {/* HARD */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRating("hard");
              }}
              className={`py-3 px-3 rounded-xl border font-bold text-xs flex flex-col items-center space-y-1 transition-all active:scale-95 ${
                currentRating === "hard"
                  ? "bg-rose-500/25 border-rose-500 text-rose-200 shadow-lg shadow-rose-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-300"
              }`}
            >
              <div className="flex items-center space-x-1 text-rose-400">
                <Flame className="h-3.5 w-3.5" />
                <span>Hard</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">Needs Review</span>
            </button>

            {/* MEDIUM */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRating("medium");
              }}
              className={`py-3 px-3 rounded-xl border font-bold text-xs flex flex-col items-center space-y-1 transition-all active:scale-95 ${
                currentRating === "medium"
                  ? "bg-amber-500/25 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40 hover:bg-amber-500/10 text-slate-300"
              }`}
            >
              <div className="flex items-center space-x-1 text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Medium</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">Partial Recall</span>
            </button>

            {/* EASY */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRating("easy");
              }}
              className={`py-3 px-3 rounded-xl border font-bold text-xs flex flex-col items-center space-y-1 transition-all active:scale-95 ${
                currentRating === "easy"
                  ? "bg-emerald-500/25 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-300"
              }`}
            >
              <div className="flex items-center space-x-1 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>Easy</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">Mastered</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={() => {
              setCurrentIdx(0);
              setFlipped(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart Deck</span>
          </button>

          <div className="flex space-x-2.5">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition-colors text-slate-300"
              title="Previous card"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            {currentIdx === filteredCards.length - 1 ? (
              <button
                onClick={() => setIsDeckFinished(true)}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Deck</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors text-slate-300"
                title="Next card"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EMPTY FILTER STATE (When active deck is on a filter with 0 items)
  if (deckActive && filteredCards.length === 0) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in py-12 text-center">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
            {filterMode === "hard" ? (
              <Flame className="h-6 w-6 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            )}
          </div>

          <h3 className="font-display text-base font-bold text-slate-100">
            {filterMode === "hard"
              ? "No Hard Cards Flagged Yet"
              : "All Cards Reviewed!"}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            {filterMode === "hard"
              ? "None of the cards in this deck are currently rated 'Hard'. As you review, rate difficult cards as Hard to focus on them here."
              : "Every card in this deck has been rated. You can review all cards or focus exclusively on hard cards."}
          </p>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => handleStartReview("all")}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Study All Cards ({stats.total})
            </button>
            <button
              onClick={() => setDeckActive(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Exit to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DECK FINISHED SUMMARY VIEW
  if (deckActive && isDeckFinished) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-slide-up py-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Award className="h-8 w-8 text-emerald-400" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-100">Deck Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">
              You reviewed {filteredCards.length} cards in this session.
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/70 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-400">Easy (Mastered)</p>
              <p className="font-display text-xl font-extrabold text-slate-100 mt-1">{stats.easy}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-amber-400">Medium</p>
              <p className="font-display text-xl font-extrabold text-slate-100 mt-1">{stats.medium}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-rose-400">Hard (Review)</p>
              <p className="font-display text-xl font-extrabold text-slate-100 mt-1">{stats.hard}</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {stats.hard > 0 && (
              <button
                onClick={() => handleStartReview("hard")}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-3 rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Flame className="h-4 w-4" />
                <span>Review Hard Cards ({stats.hard})</span>
              </button>
            )}

            <button
              onClick={() => handleStartReview("all")}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restart All Cards ({stats.total})</span>
            </button>

            <button
              onClick={() => {
                setDeckActive(false);
                setIsDeckFinished(false);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-all"
            >
              Back to Deck Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OVERVIEW / LAUNCHER VIEW
  const hasExistingDeck = cards.length > 0;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up pb-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">
          Study Flashcards
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Active recall practice with persistent ratings and focused review filters.
        </p>
      </div>

      {/* RESUME DECK HERO CARD (When existing deck is found in SQLite) */}
      {hasExistingDeck && !showGeneratorForm && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>Saved Flashcard Deck</span>
              </span>
              <h2 className="font-display text-xl font-bold text-slate-100">
                {cards[0]?.deck_name || "Key Concepts & Terminology"}
              </h2>
              <p className="text-xs text-slate-400">
                Document: <strong className="text-slate-300">{activeDocument.title}</strong>
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-200">
              {stats.total} Cards
            </span>
          </div>

          {/* Mastery Progress Meter */}
          <div className="space-y-2 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/70">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-brand-400" />
                <span>Retention Progress</span>
              </span>
              <span className="text-emerald-400 font-bold">{stats.masteredPercent}% Mastered</span>
            </div>

            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${(stats.easy / (stats.total || 1)) * 100}%` }} 
                className="bg-emerald-500 transition-all duration-300"
              />
              <div 
                style={{ width: `${(stats.medium / (stats.total || 1)) * 100}%` }} 
                className="bg-amber-500 transition-all duration-300"
              />
              <div 
                style={{ width: `${(stats.hard / (stats.total || 1)) * 100}%` }} 
                className="bg-rose-500 transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[10px]">
              <div className="bg-slate-900/60 py-1.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block">{stats.easy}</span>
                <span className="text-slate-400">Mastered</span>
              </div>
              <div className="bg-slate-900/60 py-1.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block">{stats.medium}</span>
                <span className="text-slate-400">Medium</span>
              </div>
              <div className="bg-slate-900/60 py-1.5 rounded-lg border border-slate-800">
                <span className="text-rose-400 font-bold block">{stats.hard}</span>
                <span className="text-slate-400">Hard</span>
              </div>
              <div className="bg-slate-900/60 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-300 font-bold block">{stats.unreviewed}</span>
                <span className="text-slate-500">Unreviewed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleStartReview("all")}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Resume Full Deck ({stats.total})</span>
              </button>

              <button
                onClick={() => handleStartReview("hard")}
                disabled={stats.hard === 0}
                className="bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/40 text-slate-200 hover:text-rose-300 font-semibold text-xs py-3.5 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Flame className="h-4 w-4 text-rose-400" />
                <span>Review Hard Cards ({stats.hard})</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowGeneratorForm(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center space-x-1.5 mx-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate New / Additional Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATOR CONFIGURATION FORM (Shown when no cards exist or user clicked generate new deck) */}
      {(!hasExistingDeck || showGeneratorForm) && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-100">
                {hasExistingDeck ? "Generate New Flashcards" : "Create Flashcard Deck"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Extract high-yield definitions and question cards from <strong>{activeDocument.title}</strong>.
              </p>
            </div>
            {hasExistingDeck && (
              <button
                type="button"
                onClick={() => setShowGeneratorForm(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleGenerateNewDeck} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Deck Name</label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="e.g. Key Terms, Formulas, Exam High-Yield"
                className="w-full bg-slate-950/60 hover:bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Card Quantity</label>
              <input
                type="number"
                value={cardCount}
                onChange={(e) => setCardCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 20)))}
                min="5"
                max="50"
                className="w-full bg-slate-950/60 hover:bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-500">Recommended: 15 to 30 cards per study topic.</p>
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs py-3.5 rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing flashcards with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Flashcard Deck</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
