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
  const [expandedGuidance, setExpandedGuidance] = useState({});

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
    { id: "behavioral", name: "Behavioral Scenarios" },
    { id: "project", name: "Project Architecture" },
    { id: "hr", name: "HR & Culture Fit" },
    { id: "mock_interview", name: "Mock Simulation" }
  ];

  if (prepActive && prepData) {
    const activeQuestionsList = prepData[activeTab] || [];
    
    return (
      <div className="space-y-6 animate-slide-up pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">Interview Prep Guide</h1>
            <p className="text-xs text-slate-400 mt-1">Generated from your profile and target job description</p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl border border-white/[0.08] transition-all"
          >
            Configure New Profile
          </button>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-white/[0.08] overflow-x-auto scrollbar-none">
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
                className={`px-5 py-3 text-xs font-semibold font-mono border-b-2 transition-all -mb-px shrink-0 ${
                  activeTab === t.id
                    ? "border-sky-400 text-sky-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
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
                    className="glass-card rounded-2xl p-5 space-y-4 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-400">
                          MOCK QUESTION {idx + 1}
                        </span>
                        <div className="text-xs font-bold leading-relaxed text-slate-100">
                          <MarkdownRenderer content={item.question} compact />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleGuidance(idx)}
                        className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-white/[0.06] space-y-2 animate-slide-up">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          <span>EXPECTED ANSWER HINTS & TALKING POINTS:</span>
                        </p>
                        <div className="text-xs text-slate-300 leading-relaxed bg-black/20 rounded-xl p-3.5 border border-white/[0.04]">
                          <MarkdownRenderer content={item.expected_answer_hint} compact />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
              <ul className="divide-y divide-white/[0.06]">
                {activeQuestionsList.map((q, idx) => (
                  <li key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start space-x-3.5 text-xs text-slate-300 leading-relaxed font-medium">
                    <span className="h-6 w-6 bg-sky-500/10 text-sky-400 font-mono font-bold text-[11px] rounded-lg border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <span className="select-text flex-1">
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

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up pb-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">Interview Prep</h1>
        <p className="text-xs text-slate-400 mt-1">Cross-examine your resume against target job requirements to generate customized mock panels.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
        {/* Resume Select Dropdown */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Resume Document</label>
          <div className="relative flex items-center">
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-sky-500/50 focus:bg-[#0c1017] transition-all cursor-pointer appearance-none pr-8"
            >
              <option value="" className="bg-[#0c1017]">Select uploaded resume file...</option>
              {documents.filter(d => d.status === "ready").map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-[#0c1017]">
                  {doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 absolute right-4 pointer-events-none text-slate-500" />
          </div>
          <p className="text-[10px] text-slate-500">
            Need to add your resume? Upload it on the <a href="/upload" className="text-sky-400 hover:underline">Upload Page</a>.
          </p>
        </div>

        {/* Job Description Textarea */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description, roles, requirements, and required tech stack here..."
            className="w-full h-44 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-sky-500/50 focus:bg-[#0c1017] transition-all resize-none"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 text-xs text-rose-400 font-semibold bg-rose-500/10 px-4 py-3 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleStartPrep}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing profile & synthesizing questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Interview Guide</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;
