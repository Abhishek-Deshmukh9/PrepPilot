import React, { useState, useEffect } from "react";
import { 
  HelpCircle, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Check, 
  X, 
  Award,
  ChevronRight,
  RefreshCw,
  Info
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import studyService from "../services/studyService";
import MarkdownRenderer from "../components/common/MarkdownRenderer";

const MCQPage = () => {
  const { activeDocument } = useDocuments();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // MCQ parameters
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [mcqs, setMcqs] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Reset states when active document changes
  useEffect(() => {
    setQuizStarted(false);
    setMcqs([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
    setErrorMsg("");
  }, [activeDocument]);

  const handleStartQuiz = async () => {
    if (!activeDocument) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await studyService.generateMCQs(activeDocument.id, questionCount, difficulty);
      if (data.mcqs && data.mcqs.length > 0) {
        setMcqs(data.mcqs);
        setQuizStarted(true);
        setCurrentIdx(0);
        setSelectedOption(null);
        setAnswerChecked(false);
        setScore(0);
        setQuizFinished(false);
      } else {
         throw new Error("No MCQs could be generated from this document.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate MCQs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    if (answerChecked) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || answerChecked) return;
    setAnswerChecked(true);
    const correct = mcqs[currentIdx].correct_answer;
    if (selectedOption === correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setAnswerChecked(false);
    if (currentIdx + 1 < mcqs.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setMcqs([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (!activeDocument) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-full text-amber-500 border border-amber-100/50 dark:border-amber-900/30">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h3 className="font-display text-md font-bold">Select Document for Quiz Practice</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          Open the sidebar and pick a study guide. Once active, this tool scans notes and creates a custom multiple-choice quiz.
        </p>
      </div>
    );
  }

  // Quiz Finished view
  if (quizFinished) {
    const percentage = Math.round((score / mcqs.length) * 100);
    return (
      <div className="max-w-md mx-auto glass-panel rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-lg text-center space-y-6 animate-slide-up">
        <div className="inline-flex bg-brand-50 dark:bg-brand-950/40 p-4 rounded-full text-brand-600 dark:text-brand-400 shadow-inner">
          <Award className="h-10 w-10 animate-pulse-subtle" />
        </div>
        
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-black">Practice Completed!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Knowledge assessment completed successfully.</p>
        </div>

        {/* Score Ring Display */}
        <div className="py-4">
          <div className="inline-flex flex-col items-center justify-center h-32 w-32 rounded-full border-4 border-brand-500 bg-brand-50/25 dark:bg-brand-950/20 shadow-md">
            <span className="font-display text-3xl font-black text-slate-800 dark:text-slate-100">{score}/{mcqs.length}</span>
            <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wide">{percentage}% Correct</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {percentage >= 80 ? "Superb job! You've masterfully retained this concept." : 
           percentage >= 50 ? "Good effort. Review explanations and retry to score higher!" : 
           "We recommend reviewing summaries or using RAG Chat before retaking."}
        </div>

        <button
          onClick={handleRestart}
          className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>New Practice Quiz</span>
        </button>
      </div>
    );
  }

  // Active Quiz View
  if (quizStarted && mcqs.length > 0) {
    const activeQ = mcqs[currentIdx];
    const isCorrect = selectedOption === activeQ.correct_answer;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        {/* Progress header bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-white/50 text-xs font-semibold">
          <span>Question <span className="text-brand-500">{currentIdx + 1}</span> of {mcqs.length}</span>
          <div className="w-1/2 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / mcqs.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-slate-400">{activeQ.difficulty || difficulty}</span>
        </div>

        {/* Question Panel */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
          <div className="font-display text-md md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed select-text">
            <MarkdownRenderer content={activeQ.question} compact />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {Object.entries(activeQ.options).map(([key, val]) => {
              const isSelected = selectedOption === key;
              const isCorrectOpt = activeQ.correct_answer === key;
              
              let cardStyles = "border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10";
              if (isSelected) {
                cardStyles = "border-brand-500 bg-brand-50/30 dark:bg-brand-950/10 text-brand-600 dark:text-brand-400 font-medium";
              }
              if (answerChecked) {
                if (isCorrectOpt) {
                  cardStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                } else if (isSelected) {
                  cardStyles = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold";
                } else {
                  cardStyles = "border-slate-100 dark:border-slate-900 opacity-60";
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  disabled={answerChecked}
                  className={`w-full text-left p-4 rounded-2xl border text-xs flex justify-between items-center transition-all ${cardStyles}`}
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-display font-extrabold text-[10px] ${
                      isSelected ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {key}
                    </span>
                    <span className="leading-relaxed">
                      <MarkdownRenderer content={val} compact />
                    </span>
                  </div>
                  {answerChecked && isCorrectOpt && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                  {answerChecked && isSelected && !isCorrectOpt && <X className="h-4 w-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleRestart}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Quit Quiz
            </button>

            {!answerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 disabled:opacity-40 transition-all"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:scale-[1.02]"
              >
                <span>{currentIdx + 1 === mcqs.length ? "Finish Quiz" : "Next Question"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Explanatory Answer Panel */}
        {answerChecked && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-2 animate-slide-up bg-white/70">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Info className="h-3.5 w-3.5 mr-1.5 text-brand-500" />
              <span>Explanation Details</span>
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <MarkdownRenderer content={activeQ.explanation} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-Quiz Configuration Screen
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">MCQ Practice</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate targeted question sets from active knowledge bases.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6 bg-white/50">
        {/* Quantity selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Number of Questions</label>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 50].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  questionCount === num
                    ? "border-brand-500 bg-brand-50/20 text-brand-600 dark:text-brand-400"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {num} Qs
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {["easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                  difficulty === diff
                    ? "border-brand-500 bg-brand-50/20 text-brand-600 dark:text-brand-400"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2.5 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-3.5 rounded-xl shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Exam Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Practice Exam</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MCQPage;
