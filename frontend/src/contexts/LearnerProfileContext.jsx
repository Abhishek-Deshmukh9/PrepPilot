import React, { createContext, useContext, useState, useEffect } from "react";

const LearnerProfileContext = createContext();

export const ARCHETYPES = {
  student_a: {
    id: "student_a",
    name: "Student A",
    badgeLabel: "Visual Learner",
    subtitle: "Strong visual learner • Weak logarithms",
    currentSubject: "Computer Science & Algorithms",
    currentTopic: "Binary Search",
    currentObjective: "Understand why Binary Search achieves O(log n) time complexity",
    confidenceLevel: "Medium",
    masteryLevel: 70,
    weakConcepts: ["Logarithms as inverse of repeated halving", "Asymptotic tight bounds"],
    frequentlyMadeMistakes: ["Overlooking monotonic order requirement"],
    preferredExplanationStyle: "visual", // 'visual' | 'fundamentals_first' | 'worked_examples' | 'advanced_fast'
    learningSpeed: "accelerated",
    recentQuizPerformance: {
      quizzesTaken: 8,
      averageScore: 78,
      lastScore: 75,
      recentErrors: ["Missed logarithm base definition in halving proof"]
    },
    prerequisiteGaps: ["Logarithm definition: $2^k = n \\iff k = \\log_2 n$"],
    masteredPrerequisites: ["Array indexing", "Linear search $O(n)$"],
    nextStep: {
      action: "Test your understanding with a visual halving check",
      buttonText: "Take 1-Question Check →",
      type: "quiz",
      reason: "Recommended because you understand visual models best and need to solidify logarithms."
    },
    learningLoopState: {
      whereAmI: "Binary Search",
      whatAmILearning: "Why Binary Search is $O(\\log_2 n)$ through array halving",
      whatShouldIDo: "Try a quick understanding check on array halving",
      whyAmISeeingThis: "Because you struggled with logarithm proofs twice",
      whatShouldILearnNext: "Logarithms → Binary Search → Merge Sort"
    },
    tutorRationale: "Preferred learning style is Visual. Explaining concepts with interactive array halving simulations and graphical step-by-step models."
  },

  student_b: {
    id: "student_b",
    name: "Student B",
    badgeLabel: "Beginner",
    subtitle: "Beginner • 45% mastery • Weak prerequisites",
    currentSubject: "Computer Science & Discrete Math",
    currentTopic: "Binary Search Fundamentals",
    currentObjective: "Master foundational repeated division and search interval shrinking",
    confidenceLevel: "Low",
    masteryLevel: 45,
    weakConcepts: ["Logarithms as repeated division", "Exponential halving ($2^k = n$)", "Midpoint formula"],
    frequentlyMadeMistakes: ["Assuming $O(\\log n)$ is linear division", "Confusing base-2 with base-10 logs"],
    preferredExplanationStyle: "fundamentals_first",
    learningSpeed: "steady",
    recentQuizPerformance: {
      quizzesTaken: 5,
      averageScore: 48,
      lastScore: 45,
      recentErrors: ["Failed question on why 1,000,000 takes 20 steps", "Forgot logarithm base definition"]
    },
    prerequisiteGaps: [
      "Logarithm definition: $2^k = n \\iff k = \\log_2 n$",
      "Repeated division mechanics ($n \\to n/2 \\to n/4 \\dots$)"
    ],
    masteredPrerequisites: ["Basic Arithmetic & Inequalities"],
    nextStep: {
      action: "Review foundational logarithms and exponents first",
      buttonText: "Review Logarithms First →",
      type: "prerequisite",
      reason: "Recommended because foundational gaps in logarithms block comprehension of recurrence proofs."
    },
    learningLoopState: {
      whereAmI: "Binary Search Fundamentals",
      whatAmILearning: "How repeated division by 2 creates logarithmic time",
      whatShouldIDo: "Review the $2^k = n \\iff k = \\log_2 n$ prerequisite",
      whyAmISeeingThis: "Identified foundational prerequisite gap in logarithms",
      whatShouldILearnNext: "Powers of 2 → Repeated Halving → Binary Search"
    },
    tutorRationale: "Identified foundational prerequisite gap in Logarithms & Exponential Halving. Explaining missing prerequisites first before diving into formal recurrence relations."
  },

  student_c: {
    id: "student_c",
    name: "Student C",
    badgeLabel: "Conceptual / Calc Slips",
    subtitle: "Strong conceptual understanding • Calculation slips",
    currentSubject: "Algorithms & Physics",
    currentTopic: "Binary Search & Complexity Analysis",
    currentObjective: "Eliminate boundary off-by-one errors and calculation slip-ups",
    confidenceLevel: "Medium",
    masteryLevel: 68,
    weakConcepts: ["Off-by-one loop boundaries ($left \\le right$)", "Arithmetic mid overflow"],
    frequentlyMadeMistakes: ["Setting $right = mid$ instead of $mid - 1$", "Calculation sign mistakes in multi-step equations"],
    preferredExplanationStyle: "worked_examples",
    learningSpeed: "steady",
    recentQuizPerformance: {
      quizzesTaken: 10,
      averageScore: 71,
      lastScore: 68,
      recentErrors: ["Infinite loop on single-element array", "Arithmetic slip in midpoint calculation"]
    },
    prerequisiteGaps: ["Boundary edge-case testing ($n=1, n=0$)"],
    masteredPrerequisites: ["Asymptotic notation $\\mathcal{O}(\\log n)$", "Recursion concepts"],
    nextStep: {
      action: "Step through a worked example fixing off-by-one errors",
      buttonText: "Practice Worked Example →",
      type: "practice",
      reason: "Recommended because concepts are solid, but practice is needed to prevent off-by-one bugs."
    },
    learningLoopState: {
      whereAmI: "Binary Search Implementation",
      whatAmILearning: "Loop termination conditions and mid pointer calculation",
      whatShouldIDo: "Step through a worked example highlighting $L, mid, R$",
      whyAmISeeingThis: "Because you made 2 off-by-one pointer errors in recent quizzes",
      whatShouldILearnNext: "Boundary Fixing → Binary Search → Binary Search Trees"
    },
    tutorRationale: "Conceptually strong but prone to formula calculation mistakes. Providing step-by-step worked numerical examples with intermediate sanity-check verification."
  },

  student_d: {
    id: "student_d",
    name: "Student D",
    badgeLabel: "Fast Learner",
    subtitle: "Fast learner • 85% mastery • Ready for advanced questions",
    currentSubject: "Advanced Algorithms & Data Structures",
    currentTopic: "Binary Search to Merge Sort & Trees",
    currentObjective: "Synthesize Divide-and-Conquer recurrences and advance to Merge Sort & BSTs",
    confidenceLevel: "High",
    masteryLevel: 85,
    weakConcepts: ["Master Theorem Case 2 edge boundary"],
    frequentlyMadeMistakes: ["Rushing through Master Theorem constraints"],
    preferredExplanationStyle: "advanced_fast",
    learningSpeed: "fast",
    recentQuizPerformance: {
      quizzesTaken: 12,
      averageScore: 88,
      lastScore: 92,
      recentErrors: ["Overlooked $a \\ge 1$ constraint in Master Theorem"]
    },
    prerequisiteGaps: [],
    masteredPrerequisites: ["Binary Search $O(\\log n)$", "Logarithm derivations", "Array memory models"],
    nextStep: {
      action: "You're ready to move on to Divide-and-Conquer Merge Sort",
      buttonText: "Continue to Merge Sort →",
      type: "advance",
      reason: "Recommended because you have reached 85%+ mastery in Binary Search."
    },
    learningLoopState: {
      whereAmI: "Binary Search Mastery Check",
      whatAmILearning: "Generalizing Divide-and-Conquer: $T(n) = aT(n/b) + f(n)$",
      whatShouldIDo: "Advance to Merge Sort recurrence $T(n) = 2T(n/2) + O(n)$",
      whyAmISeeingThis: "You have mastered Binary Search ($85\\%$ score)",
      whatShouldILearnNext: "Binary Search → Merge Sort ($O(n \\log n)$) → Binary Search Trees"
    },
    tutorRationale: "High mastery student ready for accelerated advanced synthesis. Providing fast-paced theoretical derivations and connecting to advanced Divide-and-Conquer algorithms."
  }
};

export const LearnerProfileProvider = ({ children }) => {
  const [activeArchetypeId, setActiveArchetypeId] = useState(() => {
    return localStorage.getItem("preppilot_archetype") || "student_a";
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("preppilot_learner_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ARCHETYPES["student_a"];
  });

  // Switch between Student A, B, C, D archetypes
  const switchArchetype = (archetypeId) => {
    const target = ARCHETYPES[archetypeId] || ARCHETYPES["student_a"];
    setActiveArchetypeId(archetypeId);
    setProfile(target);
    localStorage.setItem("preppilot_archetype", archetypeId);
    localStorage.setItem("preppilot_learner_profile", JSON.stringify(target));
  };

  // Update specific fields of current profile
  const updateProfile = (partialFields) => {
    setProfile(prev => {
      const updated = { ...prev, ...partialFields };
      localStorage.setItem("preppilot_learner_profile", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <LearnerProfileContext.Provider value={{
      profile,
      activeArchetypeId,
      switchArchetype,
      updateProfile,
      archetypes: ARCHETYPES
    }}>
      {children}
    </LearnerProfileContext.Provider>
  );
};

export const useLearnerProfile = () => {
  const context = useContext(LearnerProfileContext);
  if (!context) {
    throw new Error("useLearnerProfile must be used within a LearnerProfileProvider");
  }
  return context;
};

export default LearnerProfileContext;
