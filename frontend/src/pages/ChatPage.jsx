import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  LayoutGrid, 
  Columns, 
  Network,
  ShieldCheck, 
  Database, 
  GitBranch, 
  FileText,
  Eye,
  EyeOff,
  Maximize2
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import { LearnerProfileProvider, useLearnerProfile } from "../contexts/LearnerProfileContext";
import LearnerProfileHUD from "../components/companion/LearnerProfileHUD";
import LearningLoopTracker from "../components/companion/LearningLoopTracker";
import AITutorChat from "../components/companion/AITutorChat";
import VisualCanvas from "../components/canvas/VisualCanvas";
import CompactInsightsPanel from "../components/companion/CompactInsightsPanel";
import companionService from "../services/companionService";

const TOPIC_OPTIONS = [
  { id: "study_navigator", name: "Study Navigator", tag: "Mentor Path", icon: Compass },
  { id: "knowledge_graph", name: "Knowledge Graph", tag: "Evolving Concepts", icon: Brain },
  { id: "binary_search", name: "Binary Search", tag: "Array Halving", icon: Layers },
  { id: "osi_model", name: "OSI 7-Layer Model", tag: "Data Flow Stack", icon: Network },
  { id: "tcp_handshake", name: "TCP Handshake", tag: "SYN → SYN-ACK → ACK", icon: ShieldCheck },
  { id: "dbms_normalization", name: "DBMS Normalization", tag: "1NF → 2NF → 3NF", icon: Database },
  { id: "newtons_laws", name: "Newton's Laws", tag: "Force Vectors & F=ma", icon: Compass },
  { id: "data_structure", name: "BST Trees", tag: "Binary Search Tree", icon: GitBranch },
  { id: "recursion_dp", name: "Recursion & DP", tag: "Call Stack & Remediation", icon: Sparkles }
];

const ChatPageContent = () => {
  const { activeDocument } = useDocuments();
  const { profile } = useLearnerProfile();
  
  // Active Topic & Session
  const [selectedTopicId, setSelectedTopicId] = useState("binary_search");
  const currentTopic = TOPIC_OPTIONS.find(t => t.id === selectedTopicId)?.name || "Binary Search";
  
  const [sessionId] = useState(() => {
    let saved = localStorage.getItem("preppilot_companion_session");
    if (!saved) {
      saved = `companion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("preppilot_companion_session", saved);
    }
    return saved;
  });

  // 3-Pane State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visualPayload, setVisualPayload] = useState(null);
  
  // Canvas Collapse / Expansion Toggle
  const [showCanvas, setShowCanvas] = useState(true);

  // Student Learning State HUD
  const [studentState, setStudentState] = useState({
    mastery: profile.masteryLevel || 70,
    confidenceLevel: profile.confidenceLevel || "Medium",
    prerequisiteMissing: profile.prerequisiteGaps[0] || "Logarithms & Exponential Halving ($2^k = n \\implies k = \\log_2 n$)"
  });

  // Re-sync studentState when profile changes
  useEffect(() => {
    setStudentState({
      mastery: profile.masteryLevel,
      confidenceLevel: profile.confidenceLevel,
      prerequisiteMissing: profile.prerequisiteGaps[0] || profile.weakConcepts[0] || "Foundational concepts"
    });
  }, [profile]);

  // Initial load
  useEffect(() => {
    const initDefaultTopic = async () => {
      let initialQuery = "Why does binary search take O(log n)?";
      if (profile.id === "student_d") {
        initialQuery = "Explain Dynamic Programming memoization and how it works";
      }

      const initialResponse = await companionService.queryTutor({
        sessionId,
        documentId: activeDocument?.id,
        question: initialQuery,
        currentTopic: profile.id === "student_d" ? "Recursion & DP" : "Binary Search",
        learnerProfile: profile
      });

      setMessages([
        { sender: "user", text: initialQuery },
        {
          sender: "ai",
          text: initialResponse.answer,
          tutorRationale: initialResponse.tutorRationale,
          prerequisiteDiagnosis: initialResponse.prerequisiteDiagnosis,
          visualPayload: initialResponse.visual_payload,
          followupQuestions: initialResponse.followup_questions
        }
      ]);

      setVisualPayload(initialResponse.visual_payload);
    };

    initDefaultTopic();
  }, [sessionId, profile.id]);

  // Handle user question from AI Tutor Chat
  const handleSendMessage = async (questionText) => {
    if (!questionText.trim() || isLoading) return;

    setMessages(prev => [...prev, { sender: "user", text: questionText }]);
    setIsLoading(true);

    try {
      const response = await companionService.queryTutor({
        sessionId,
        documentId: activeDocument?.id,
        question: questionText,
        currentTopic,
        learnerProfile: profile
      });

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: response.answer,
          tutorRationale: response.tutorRationale,
          prerequisiteDiagnosis: response.prerequisiteDiagnosis,
          visualPayload: response.visual_payload,
          followupQuestions: response.followup_questions
        }
      ]);

      if (response.visual_payload) {
        setVisualPayload(response.visual_payload);
        setShowCanvas(true); // Automatically expand canvas when visual is provided
      }

      setStudentState(prev => ({
        ...prev,
        mastery: Math.min(prev.mastery + 3, 100),
        prerequisiteMissing: response.prerequisiteDiagnosis || prev.prerequisiteMissing
      }));

    } catch (err) {
      console.error("Companion query error:", err);
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "I encountered an error analyzing your question. Please verify your connection or try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click-to-explain from visual canvas components
  const handleComponentClick = async (componentData) => {
    setIsLoading(true);
    try {
      const explanation = await companionService.explainComponent(componentData);
      
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: explanation.answer,
          tutorRationale: explanation.tutorRationale,
          prerequisiteDiagnosis: explanation.prerequisiteDiagnosis,
          followupQuestions: explanation.followup_questions
        }
      ]);
    } catch (err) {
      console.error("Component click explanation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSwitch = async (topicId) => {
    setSelectedTopicId(topicId);
    const targetTopic = TOPIC_OPTIONS.find(t => t.id === topicId);
    if (!targetTopic) return;

    setIsLoading(true);
    try {
      let queryPrompt = "Why does binary search take O(log n)?";
      if (topicId === "study_navigator") queryPrompt = "What should I study today based on my learning profile?";
      else if (topicId === "knowledge_graph") queryPrompt = "Show my evolving Knowledge Graph and concept prerequisite map";
      else if (topicId === "osi_model") queryPrompt = "Explain the OSI 7-layer model and how data flows through the stack";
      else if (topicId === "tcp_handshake") queryPrompt = "How does the TCP 3-way handshake work with SYN, SYN-ACK, and ACK?";
      else if (topicId === "dbms_normalization") queryPrompt = "Explain 1NF, 2NF, and 3NF database normalization";
      else if (topicId === "newtons_laws") queryPrompt = "How do Newton's laws apply to force vectors, friction, and acceleration?";
      else if (topicId === "data_structure") queryPrompt = "Explain Binary Search Tree properties and inorder traversal";
      else if (topicId === "recursion_dp") queryPrompt = "Explain Dynamic Programming memoization and call stack";

      if (topicId === "study_navigator") {
        setVisualPayload({ visual_type: "study_navigator", title: "Proactive Study Navigator" });
        setShowCanvas(true);
      } else if (topicId === "knowledge_graph") {
        setVisualPayload({ visual_type: "knowledge_graph", title: "Interactive Knowledge Graph" });
        setShowCanvas(true);
      }

      const res = await companionService.queryTutor({
        sessionId,
        documentId: activeDocument?.id,
        question: queryPrompt,
        currentTopic: targetTopic.name,
        learnerProfile: profile
      });

      setMessages([
        { sender: "user", text: queryPrompt },
        {
          sender: "ai",
          text: res.answer,
          tutorRationale: res.tutorRationale,
          prerequisiteDiagnosis: res.prerequisiteDiagnosis,
          visualPayload: res.visual_payload,
          followupQuestions: res.followup_questions
        }
      ]);

      setVisualPayload(res.visual_payload);
      setShowCanvas(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Reset study session and clear chat history?")) {
      setMessages([]);
    }
  };

  const handleNextStep = (nextStepData) => {
    if (!nextStepData) return;
    if (nextStepData.type === "quiz") {
      handleSendMessage("Quiz me on this concept");
    } else if (nextStepData.type === "prerequisite") {
      handleSendMessage("Explain the missing prerequisite in simple terms");
    } else if (nextStepData.type === "practice") {
      handleSendMessage("Give me a step-by-step worked example");
    } else {
      handleSendMessage("What is the next topic after Binary Search?");
    }
  };

  return (
    <div className="flex flex-col space-y-4 pb-8 min-h-screen">
      
      {/* Top Learning Environment Navigation Bar */}
      <div className="p-3.5 bg-white/85 dark:bg-slate-900/85 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Topic Selector */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                PrepPilot Learning Companion
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-bold border border-brand-500/20">
                Socratic AI Tutor
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1 overflow-x-auto">
              <span>Topic:</span>
              <div className="flex items-center space-x-1">
                {TOPIC_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleTopicSwitch(opt.id)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 ${
                        selectedTopicId === opt.id
                          ? "bg-brand-600 text-white shadow-xs font-bold scale-[1.02]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Visibility Toggle & Active Document Indicator */}
        <div className="flex items-center space-x-2">
          {activeDocument && (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 rounded-xl text-[11px] text-brand-700 dark:text-brand-300 font-medium">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-32">{activeDocument.filename}</span>
            </div>
          )}

          {/* Toggle Visual Canvas Button */}
          <button
            onClick={() => setShowCanvas(!showCanvas)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
              showCanvas 
                ? "bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
            title="Toggle Visual Canvas"
          >
            {showCanvas ? <Eye className="w-3.5 h-3.5 text-brand-500" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCanvas ? "Canvas Visible" : "Canvas Hidden"}</span>
          </button>
        </div>
      </div>

      {/* LEARNER PROFILE HUD (1-Click Archetype Switcher) */}
      <LearnerProfileHUD />

      {/* LEARNING LOOP TRACKER (Where am I, What am I learning, Next Action) */}
      <LearningLoopTracker 
        activeTopic={currentTopic}
        onActionClick={handleNextStep}
      />

      {/* RESPONSIVE 3-PANEL LEARNING WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* AREA 1: AI Tutor Conversation (Primary Interaction, ~35-40% or full width when canvas is hidden) */}
        <div className={`transition-all duration-300 ${
          showCanvas ? "lg:col-span-4" : "lg:col-span-8"
        } h-[680px] lg:h-[720px]`}>
          <AITutorChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeTopic={currentTopic}
            studentState={studentState}
            learnerProfile={profile}
            onTriggerVisual={(payload) => {
              setVisualPayload(payload);
              setShowCanvas(true);
            }}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* AREA 2: Visual Learning Canvas (Contextual Center Stage, ~40%) */}
        {showCanvas && (
          <div className="lg:col-span-5 h-[680px] lg:h-[720px] transition-all duration-300">
            <VisualCanvas
              visualPayload={visualPayload}
              activeTopic={currentTopic}
              onComponentClick={handleComponentClick}
            />
          </div>
        )}

        {/* AREA 3: Compact Learning Insights (Right Dock, ~25%) */}
        <div className={`transition-all duration-300 ${
          showCanvas ? "lg:col-span-3" : "lg:col-span-4"
        } h-[680px] lg:h-[720px]`}>
          <CompactInsightsPanel
            onTakeNextStep={handleNextStep}
          />
        </div>

      </div>
    </div>
  );
};

export const ChatPage = () => {
  return (
    <LearnerProfileProvider>
      <ChatPageContent />
    </LearnerProfileProvider>
  );
};

export default ChatPage;
