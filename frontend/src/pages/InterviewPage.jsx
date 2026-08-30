import React, { useState } from "react";
import { 
  Briefcase, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CheckCircle,
  FileText
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import interviewService from "../services/interviewService";
import MarkdownRenderer from "../components/common/MarkdownRenderer";

const InterviewPage = () => {
  const { documents } = useDocuments();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Form parameters
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // Results State
  const [prepActive, setPrepActive] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [activeTab, setActiveTab] = useState("technical");
  const [expandedGuidance, setExpandedGuidance] = useState({}); // { index: bool }

  const handleStartPrep = async () => {
    if (!resumeId) {
      setErrorMsg("Please select an uploaded resume document.");
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a job description text to match against.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const data = await interviewService.generateInterviewPrep(resumeId, jobDescription);
      setPrepData(data);
      setPrepActive(true);
      // Fallback to first available category
      const firstTab = data.technical?.length > 0 ? "technical" : 
                        data.hr?.length > 0 ? "hr" : 
                        data.behavioral?.length > 0 ? "behavioral" : "mock_interview";
      setActiveTab(firstTab);
      setExpandedGuidance({});
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate interview prep. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGuidance = (idx) => {
    setExpandedGuidance((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleReset = () => {
    setPrepActive(false);
    setPrepData(null);
    setExpandedGuidance({});
  };

  const tabs = [
    { id: "technical", name: "Technical Questions" },
    { id: "behavioral", name: "Behavioral Situations" },
    { id: "project", name: "Project Depth" },
    { id: "hr", name: "HR Fit Questions" },
    { id: "mock_interview", name: "Mock Simulation" }
  ];

  // Results rendering
  if (prepActive && prepData) {
    const activeQuestionsList = prepData[activeTab] || [];
    
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Header toolbar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Interview Prep Guide</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on resume scanning matching parameters</p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            Configure New Prep
          </button>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map((t) => {
            const hasItems = prepData[t.id] && prepData[t.id].length > 0;
            if (!hasItems) return null;
            
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setExpandedGuidance({});
                }}
                className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all -mb-px shrink-0 ${
                  activeTab === t.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="space-y-4">
          {activeTab === "mock_interview" ? (
            <div className="grid grid-cols-1 gap-4">
              {prepData.mock_interview.map((item, idx) => {
                const isExpanded = expandedGuidance[idx];
                return (
                  <div 
                    key={idx} 
                    className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm space-y-4 bg-white/70"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Mock Question {idx + 1}</span>
                        <div className="text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-100">
                          <MarkdownRenderer content={item.question} compact />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleGuidance(idx)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-slide-up">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                          <span>Talking Points & expected answer:</span>
                        </p>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          <MarkdownRenderer content={item.expected_answer_hint} compact />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 bg-white/50 space-y-4">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeQuestionsList.map((q, idx) => (
                  <li key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start space-x-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <span className="h-5 w-5 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-extrabold text-[10px] rounded-md flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <span className="select-text">
                      <MarkdownRenderer content={q} compact />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Configuration Form
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Interview Prep</h1>
        <p className="text-slate-500 dark:text-slate-400">Match your profile to targeted job descriptions to extract custom interview guides.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5 bg-white/50">
        
        {/* Resume Select Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Resume Document</label>
          <div className="relative flex items-center">
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all cursor-pointer appearance-none pr-8"
            >
              <option value="">Select uploaded resume file...</option>
              {documents.filter(d => d.status === "ready").map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 absolute right-4 pointer-events-none text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400">
            If your resume is not listed, upload it first on the <a href="/upload" className="text-brand-500 hover:underline">Upload Page</a>.
          </p>
        </div>

        {/* Job Description Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job Description Details</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description, roles, requirements, and tech stack here..."
            className="w-full h-40 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all resize-none"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2.5 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleStartPrep}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-3.5 rounded-xl shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Profiles & generating questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Compile Interview Guide</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;
