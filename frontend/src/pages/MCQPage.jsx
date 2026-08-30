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
  Info,
  SlidersHorizontal
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
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 animate-slide-up">
        <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
          <HelpCircle className="h-8 w-8 animate-pulse-subtle" />
        </div>
        <h3 className="font-display text-base font-bold text-slate-100">Select Study Document</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Choose a guide from the top navigation. PrepPilot creates targeted practice exams with immediate conceptual feedback.
        </p>
      </div>
    );
  }

  // Quiz Finished view
  if (quizFinished) {
    const percentage = Math.round((score / mcqs.length) * 100);
    return (
      <div className="max-w-md mx-auto glass-panel rounded-3xl p-8 border border-white/[0.08] shadow-2xl text-center space-y-6 animate-slide-up">
        <div className="inline-flex bg-sky-500/10 p-4 rounded-2xl text-sky-400 border border-sky-500/20 shadow-inner">
          <Award className="h-10 w-10 animate-pulse-subtle" />
        </div>
        
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-black text-slate-100">Assessment Complete</h2>
          <p className="text-slate-400 text-xs font-mono">ASSESSMENT SUMMARY & MASTERY RATE</p>
        </div>

        {/* Score Ring Display */}
        <div className="py-2">
          <div className="inline-flex flex-col items-center justify-center h-36 w-36 rounded-full border-4 border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10">
            <span className="font-display text-3xl font-black text-slate-100">{score}/{mcqs.length}</span>
            <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-widest">{percentage}% Correct</span>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed">
          {percentage >= 80 ? "Superb mastery! You have retained the key concepts from this material." : 
           percentage >= 50 ? "Solid effort. Review the explanations below and try another practice run." : 
           "We recommend reviewing key summaries or using the Socratic Companion before retaking."}
        </div>

        <button
          onClick={handleRestart}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>New Practice Exam</span>
        </button>
      </div>
    );
  }

  // Active Quiz View
  if (quizStarted && mcqs.length > 0) {
    const activeQ = mcqs[currentIdx];
    
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
        {/* Progress header bar */}
        <div className="glass-panel p-4 rounded-2xl flex justify-between items-center text-xs font-semibold">
          <span className="font-mono text-slate-300">Question <span className="text-sky-400 font-bold">{currentIdx + 1}</span> of {mcqs.length}</span>
          <div className="w-1/2 bg-white/[0.06] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / mcqs.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[9px] bg-white/[0.06] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-widest text-sky-400 border border-white/[0.08]">
            {activeQ.difficulty || difficulty}
          </span>
        </div>

        {/* Question Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="font-display text-base sm:text-lg font-bold text-slate-100 leading-relaxed select-text">
            <MarkdownRenderer content={activeQ.question} compact />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(activeQ.options).map(([key, val]) => {
              const isSelected = selectedOption === key;
              const isCorrectOpt = activeQ.correct_answer === key;
              
              let cardStyles = "border-white/[0.08] bg-white/[0.02] hover:border-sky-500/30 hover:bg-white/[0.05] text-slate-200";
              if (isSelected) {
                cardStyles = "border-sky-500 bg-sky-500/15 text-sky-200 font-medium ring-1 ring-sky-500/40";
              }
              if (answerChecked) {
                if (isCorrectOpt) {
                  cardStyles = "border-emerald-500 bg-emerald-500/15 text-emerald-200 font-bold ring-1 ring-emerald-500/40";
                } else if (isSelected) {
                  cardStyles = "border-rose-500 bg-rose-500/15 text-rose-200 font-bold ring-1 ring-rose-500/40";
                } else {
                  cardStyles = "border-white/[0.04] bg-white/[0.01] opacity-40";
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  disabled={answerChecked}
                  className={`w-full text-left p-4 rounded-2xl border text-xs flex justify-between items-center transition-all ${cardStyles}`}
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <span className={`h-7 w-7 rounded-xl flex items-center justify-center font-mono font-extrabold text-[11px] ${
                      isSelected ? "bg-sky-500 text-white" : "bg-white/[0.06] text-slate-400"
                    }`}>
                      {key}
                    </span>
                    <span className="leading-relaxed">
                      <MarkdownRenderer content={val} compact />
                    </span>
                  </div>
                  {answerChecked && isCorrectOpt && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {answerChecked && isSelected && !isCorrectOpt && <X className="h-4 w-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
            <button
              onClick={handleRestart}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Quit Quiz
            </button>

            {!answerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-40 transition-all"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
              >
                <span>{currentIdx + 1 === mcqs.length ? "Finish Quiz" : "Next Question"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Explanatory Answer Panel */}
        {answerChecked && (
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-2 animate-slide-up">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-400 flex items-center">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              <span>CONCEPTUAL EXPLANATION</span>
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed">
              <MarkdownRenderer content={activeQ.explanation} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-Quiz Configuration Screen
  return (
    <div className="max-w-md mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">MCQ Practice</h1>
        <p className="text-xs text-slate-400 mt-1">Generate targeted multiple-choice exam sets with instant grading.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
        {/* Quantity selector */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Questions</label>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 30].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  questionCount === num
                    ? "border-sky-500 bg-sky-500/15 text-sky-300 shadow-md shadow-sky-500/10"
                    : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                {num} Qs
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {["easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`py-2.5 rounded-xl border text-xs font-mono font-bold capitalize transition-all ${
                  difficulty === diff
                    ? "border-sky-500 bg-sky-500/15 text-sky-300 shadow-md shadow-sky-500/10"
                    : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 text-xs text-rose-400 font-semibold bg-rose-500/10 px-4 py-3 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating exam questions...</span>
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
