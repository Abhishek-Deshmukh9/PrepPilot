import apiClient from "./api";

/**
 * Intelligent Academic Topics & Adaptive Personal Learning Knowledge Engine
 */
const TOPIC_PRESETS = {
  "bayes_theorem": {
    topic: "Bayes' Theorem & Conditional Probability",
    matchKeywords: ["bayes", "bayes theorem", "conditional probability", "prior", "posterior", "likelihood", "p(a|b)"],
    diagnosis: "The core confusion is inverting conditional probabilities $P(A|B)$ vs $P(B|A)$. Bayes' theorem provides the exact mathematical bridge using the joint probability intersection $P(A \\cap B)$.",
    answer: "Bayes' Theorem calculates the posterior probability of an event $A$ given prior knowledge of condition $B$:\n$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$\nwhere $P(A)$ is the Prior Probability, $P(B|A)$ is the Likelihood, $P(B)$ is the Marginal Likelihood (Evidence), and $P(A|B)$ is the Posterior Probability.",
    visual_type: "mathematical_derivation",
    visual_payload: {
      title: "Mathematical Derivation: Bayes' Theorem",
      visual_type: "mathematical_derivation",
      derivation_title: "Step-by-Step Derivation of Bayes' Theorem",
      prerequisites: [
        "Definition of Conditional Probability: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$",
        "Multiplication Rule: $P(A \\cap B) = P(B \\cap A)$",
        "Law of Total Probability: $P(B) = \\sum_i P(B|A_i)P(A_i)$"
      ],
      derivation_steps: [
        {
          stepNumber: 1,
          title: "Definition of Conditional Probability $P(A|B)$",
          latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\implies P(A \\cap B) = P(A|B) \\cdot P(B)",
          annotation: "Joint probability from $A$ given $B$",
          explanation: "Expressing the joint occurrence $P(A \\cap B)$ in terms of the conditional probability $P(A|B)$."
        },
        {
          stepNumber: 2,
          title: "Symmetric Definition for $P(B|A)$",
          latex: "P(B|A) = \\frac{P(B \\cap A)}{P(A)} \\implies P(B \\cap A) = P(B|A) \\cdot P(A)",
          annotation: "Joint probability from $B$ given $A$",
          explanation: "Expressing the same joint occurrence from the perspective of $B$ given $A$."
        },
        {
          stepNumber: 3,
          title: "Equate Joint Probabilities",
          latex: "P(A \\cap B) = P(B \\cap A) \\implies P(A|B) \\cdot P(B) = P(B|A) \\cdot P(A)",
          annotation: "Intersection commutativity $A \\cap B = B \\cap A$",
          explanation: "Since set intersection is commutative, both joint expressions are strictly equal."
        },
        {
          stepNumber: 4,
          title: "Divide by Marginal Evidence $P(B)$",
          latex: "P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}",
          annotation: "Bayes' Theorem Formula",
          explanation: "Dividing both sides by $P(B)$ gives the final Bayes' formula for updating prior beliefs."
        }
      ],
      derivation_conclusion: "Bayes' formula allows updating confidence in hypothesis $A$ as new evidence $B$ is observed: $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$."
    },
    smart_notes: {
      formulas: [
        "Bayes' Formula: $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$",
        "Total Probability: $P(B) = P(B|A)P(A) + P(B|A^c)P(A^c)$",
        "Odds Ratio Form: $\\frac{P(A|B)}{P(A^c|B)} = \\frac{P(B|A)}{P(B|A^c)} \\cdot \\frac{P(A)}{P(A^c)}$"
      ],
      prerequisites: [
        { title: "Prior vs Posterior", desc: "Prior $P(A)$ is belief before data; Posterior $P(A|B)$ is belief after observing $B$." }
      ],
      key_takeaways: [
        "Fundamental basis for Naive Bayes classifiers and Bayesian machine learning.",
        "Crucial for medical diagnostic tests and false-positive paradox resolution."
      ],
      pitfalls: [
        "Base Rate Fallacy: Ignoring prior probability $P(A)$ when interpreting positive test results."
      ]
    },
    followup_questions: [
      "How does the Base Rate Fallacy affect rare disease testing?",
      "How does Naive Bayes simplify computation with independent feature assumptions?"
    ]
  },

  "series_summation": {
    topic: "Arithmetic Series Summation Proof",
    matchKeywords: ["summation", "sum", "n(n+1)/2", "arithmetic series", "gauss sum", "\\sum"],
    diagnosis: "Students often memorize $\\sum i = \\frac{n(n+1)}{2}$ without seeing Gauss's pairing technique (adding forward and backward series).",
    answer: "The sum of the first $n$ natural numbers is given by the closed-form arithmetic summation formula:\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\nGauss proved this by pairing numbers from the beginning and end: $(1 + n) + (2 + n - 1) + \\dots = n(n+1)$, then dividing by $2$.",
    visual_type: "mathematical_derivation",
    visual_payload: {
      title: "Mathematical Derivation: Series Summation",
      visual_type: "mathematical_derivation",
      derivation_title: "Gauss's Pairing Derivation for \\sum_{i=1}^n i",
      prerequisites: [
        "Summation notation: $\\sum_{i=1}^n i = 1 + 2 + 3 + \\dots + n$",
        "Addition Commutativity: $a + b = b + a$"
      ],
      derivation_steps: [
        {
          stepNumber: 1,
          title: "Write Sum in Forward Order",
          latex: "S = 1 + 2 + 3 + \\dots + (n-1) + n",
          annotation: "Forward Sequence",
          explanation: "Define $S$ as the sum of integers from $1$ to $n$."
        },
        {
          stepNumber: 2,
          title: "Write Sum in Reversed Order",
          latex: "S = n + (n-1) + (n-2) + \\dots + 2 + 1",
          annotation: "Reverse Sequence",
          explanation: "Write the identical sum in descending reverse order."
        },
        {
          stepNumber: 3,
          title: "Add the Two Equations Term-by-Term",
          latex: "2S = (n+1) + (n+1) + (n+1) + \\dots + (n+1) \\quad [n \\text{ terms}]",
          annotation: "Pair each column: (1+n), (2+n-1)...",
          explanation: "Every column adds to exactly $n + 1$, and there are $n$ such columns, so $2S = n(n+1)$."
        },
        {
          stepNumber: 4,
          title: "Divide by 2 for Final Sum",
          latex: "S = \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}",
          annotation: "Closed Form Result",
          explanation: "Dividing by $2$ yields the standard arithmetic series formula $\\mathcal{O}(n^2)$ total pairs."
        }
      ],
      derivation_conclusion: "\\sum_{i=1}^n i = \\frac{n(n+1)}{2} = \\frac{n^2 + n}{2} = \\mathcal{O}(n^2)."
    },
    smart_notes: {
      formulas: [
        "Arithmetic Sum: $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$",
        "Sum of Squares: $\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$",
        "Sum of Cubes: $\\sum_{i=1}^n i^3 = \\left(\\frac{n(n+1)}{2}\\right)^2$"
      ],
      prerequisites: [
        { title: "Closed-form formula", desc: "Allows calculating sums in $\\mathcal{O}(1)$ time instead of an $\\mathcal{O}(n)$ loop." }
      ],
      key_takeaways: [
        "Explains why nested loops take $\\mathcal{O}(n^2)$ time ($n + (n-1) + \\dots + 1 = \\frac{n(n+1)}{2}$)."
      ],
      pitfalls: [
        "Confusing 0-indexed vs 1-indexed sums."
      ]
    },
    followup_questions: [
      "How is this used to analyze BubbleSort and InsertionSort time complexities?",
      "How do you derive the sum of geometric series $\\sum r^i$?"
    ]
  },

  "binary_search": {
    topic: "Binary Search Time Complexity",
    matchKeywords: ["binary search", "log n", "log2 n", "halving", "t(n/2)", "divide and conquer search"],
    diagnosis: "The root confusion is connecting repeated halving ($n \\to n/2 \\to n/4 \\dots \\to 1$) to logarithms. Division by 2 is the exact inverse of binary exponentiation ($2^k = n \\iff k = \\log_2 n$).",
    answer: "Binary Search operates by repeatedly dividing a sorted search interval in half. At each step $i$, comparing the target with the midpoint $\\text{arr}[mid]$ eliminates half the remaining elements. Since the problem size shrinks as $\\frac{n}{2^k} = 1$, solving for the number of steps yields $k = \\log_2 n$, giving an asymptotic time complexity of $\\mathcal{O}(\\log_2 n)$ with $\\mathcal{O}(1)$ auxiliary space.",
    visual_type: "step_by_step_visualization",
    visual_payload: {
      title: "Binary Search Array Halving Animation",
      visual_type: "step_by_step_visualization",
      array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 84, 91, 98, 105, 120, 142],
      target: 23,
      derivation_title: "Mathematical Derivation: Binary Search Recurrence",
      prerequisites: [
        "Repeated division by $2$: after $k$ steps, remaining size is $\\frac{n}{2^k}$",
        "Logarithm definition: $2^k = n \\iff k = \\log_2 n$",
        "Recurrence relation: $T(n) = T(n/2) + \\mathcal{O}(1)$"
      ]
    },
    smart_notes: {
      formulas: [
        "Recurrence: $T(n) = T(n/2) + \\mathcal{O}(1)$",
        "Base Case: $2^k = n \\iff k = \\log_2 n$",
        "Time Complexity: $\\mathcal{O}(\\log_2 n)$",
        "Auxiliary Space: $\\mathcal{O}(1)$ (iterative)"
      ],
      prerequisites: [
        { title: "Logarithms as Inverse of Powers", desc: "$\\log_2 n$ counts how many times you can halve $n$ before reaching $1$." },
        { title: "Sorted Array Requirement", desc: "Requires elements ordered monotonically ($A[i] \\le A[i+1]$)." }
      ],
      key_takeaways: [
        "Halves the search space at each iteration.",
        "Takes at most $20$ steps for $1,000,000$ items (50,000x faster than linear search)."
      ],
      pitfalls: [
        "Integer overflow: use $mid = left + \\lfloor (right - left) / 2 \\rfloor$.",
        "Unsorted array: running binary search on unsorted data produces arbitrary wrong answers."
      ]
    },
    followup_questions: [
      "Why doesn't binary search work on unsorted arrays?",
      "Show me how to prove this with Master Theorem",
      "What is the recurrence relation for MergeSort vs Binary Search?"
    ]
  },

  "osi_model": {
    topic: "OSI 7-Layer Protocol Architecture",
    matchKeywords: ["osi", "osi model", "7 layers", "encapsulation", "pdu", "presentation layer", "transport layer", "network layer", "data link"],
    diagnosis: "Students often confuse the boundary between Layer 3 (logical IP addressing across subnets) and Layer 2 (physical MAC addressing within a single local network segment).",
    answer: "The Open Systems Interconnection (OSI) model standardizes network communication into 7 distinct vertical abstraction layers. During transmission, data flows **downward** from Layer 7 (Application) to Layer 1 (Physical), with each layer prepending a Protocol Data Unit (PDU) header ($Data \\to \\text{Segment} \\to \\text{Packet} \\to \\text{Frame} \\to \\text{Bits}$). Upon reception at Host B, data flows **upward**, stripping headers at each stage.",
    visual_type: "osi_model",
    visual_payload: {
      title: "OSI 7-Layer Stack & Encapsulation Pipeline",
      visual_type: "osi_model"
    },
    smart_notes: {
      formulas: [
        "Encapsulation Flow: $\\text{Data} \\xrightarrow{+H_4} \\text{Segment} \\xrightarrow{+H_3} \\text{Packet} \\xrightarrow{+H_2+T_2} \\text{Frame} \\to \\text{Bits}$",
        "Layer PDUs: L7-L5 (Data), L4 (Segment/Datagram), L3 (Packet), L2 (Frame), L1 (Bits)"
      ],
      prerequisites: [
        { title: "Layer Abstraction", desc: "Each layer provides services to the layer above while shielding lower-level implementation details." },
        { title: "Logical vs Physical Addressing", desc: "IP address identifies destination node on the Internet; MAC address identifies physical interface on local link." }
      ],
      key_takeaways: [
        "Routers operate at Layer 3 (IP); Switches operate at Layer 2 (MAC); Hubs operate at Layer 1 (Bits).",
        "Transport Layer (Layer 4) handles Port multiplexing (e.g. Port 443 HTTPS)."
      ],
      pitfalls: [
        "Confusing TCP/IP 4-layer model with OSI 7-layer model (Session & Presentation are merged into Application in TCP/IP)."
      ]
    },
    followup_questions: [
      "What is the difference between TCP segments and UDP datagrams at Layer 4?",
      "Why is a Frame Check Sequence (CRC) added at Layer 2 but not Layer 3?",
      "How does ARP bridge Layer 2 (MAC) and Layer 3 (IP)?"
    ]
  },

  "tcp_handshake": {
    topic: "TCP 3-Way Handshake Protocol",
    matchKeywords: ["tcp", "handshake", "3-way handshake", "syn", "syn-ack", "ack", "transmission control protocol", "connection establishment"],
    diagnosis: "The core confusion is why 3 packets (not 2) are required. Two packets only confirm one-way reachability; the 3rd packet (final ACK) proves the client received the server's sequence number.",
    answer: "TCP achieves reliable, full-duplex connection establishment using a **3-way handshake**:\n1. **$\\text{SYN}$ ($x$)**: Client sends Initial Sequence Number $\\text{ISN}_C = x$, setting $\\text{SYN}=1$.\n2. **$\\text{SYN-ACK}$ ($y, x+1$)**: Server acknowledges client's sequence $\\text{ack} = x + 1$ and sends $\\text{ISN}_S = y$.\n3. **$\\text{ACK}$ ($y+1$)**: Client acknowledges server's sequence $\\text{ack} = y + 1$.\nBoth endpoints enter the `ESTABLISHED` state, guaranteeing bi-directional synchronization.",
    visual_type: "tcp_handshake",
    visual_payload: {
      title: "TCP 3-Way Handshake Timeline & Sequence Numbers",
      visual_type: "tcp_handshake"
    },
    smart_notes: {
      formulas: [
        "Step 1: $\\text{Client} \\to \\text{Server: } \\text{SYN} \\quad [\\text{seq} = x]$",
        "Step 2: $\\text{Server} \\to \\text{Client: } \\text{SYN-ACK} \\quad [\\text{seq} = y,\\, \\text{ack} = x + 1]$",
        "Step 3: $\\text{Client} \\to \\text{Server: } \\text{ACK} \\quad [\\text{seq} = x + 1,\\, \\text{ack} = y + 1]$"
      ],
      prerequisites: [
        { title: "Full-Duplex Reliability", desc: "Both directions must independently initialize sequence numbers and verify acknowledgment." }
      ],
      key_takeaways: [
        "SYN consumption: The SYN control flag consumes 1 byte in the sequence space ($ack = seq + 1$).",
        "Protects against delayed/duplicate packets from previous sessions."
      ],
      pitfalls: [
        "SYN Flood Attack: Attacker floods SYN packets without sending final ACK, exhausting server connection backlog."
      ]
    },
    followup_questions: [
      "Why can't TCP establish a connection in only 2 packets?",
      "How does a TCP 4-way connection termination (FIN-ACK) work?",
      "What is a SYN Flood attack and how do SYN cookies mitigate it?"
    ]
  },

  "dbms_normalization": {
    topic: "Database Normalization (1NF, 2NF, 3NF)",
    matchKeywords: ["normalization", "1nf", "2nf", "3nf", "dbms normalization", "functional dependency", "partial dependency", "transitive dependency", "unnormalized"],
    diagnosis: "Students frequently struggle to differentiate between Partial Dependencies (2NF violation: non-key depends on part of composite key) and Transitive Dependencies (3NF violation: non-key depends on another non-key).",
    answer: "Database normalization organizes relational schema to eliminate data redundancy and insertion, update, and deletion anomalies:\n- **1NF**: Atomic cell values, unique primary key, no repeating groups.\n- **2NF**: In 1NF + remove **Partial Functional Dependencies** ($A, B \\to C$ where $A \\to C$).\n- **3NF**: In 2NF + remove **Transitive Dependencies** ($X \\to Y \\to Z$ where $Y$ is not a superkey).",
    visual_type: "dbms_normalization",
    visual_payload: {
      title: "DBMS Normalization Step-by-Step Transformer",
      visual_type: "dbms_normalization"
    },
    smart_notes: {
      formulas: [
        "1NF: $\\forall \\text{attributes}, \\text{Domain}(A) \\subseteq \\text{Atomic Values}$",
        "2NF Violation: $\\exists (A, B) = \\text{PK}, A \\to C \\text{ (Partial Dependency)}$",
        "3NF Rule: For $X \\to Y$, $X$ must be a Superkey OR $Y$ must be a Prime Attribute"
      ],
      prerequisites: [
        { title: "Functional Dependencies", desc: "$X \\to Y$ means attribute $X$ uniquely determines attribute $Y$." },
        { title: "Composite Primary Key", desc: "A primary key composed of multiple columns (e.g. StudentID + CourseID)." }
      ],
      key_takeaways: [
        "1NF guarantees atomic tabular structure.",
        "2NF splits tables having composite keys with partial dependencies.",
        "3NF isolates transitive chains into dedicated lookup tables."
      ],
      pitfalls: [
        "Over-normalization can cause performance degradation due to excessive SQL JOIN operations."
      ]
    },
    followup_questions: [
      "What is Boyce-Codd Normal Form (BCNF) and how does it differ from 3NF?",
      "Can you give an example of an Update Anomaly in an unnormalized table?"
    ]
  },

  "newtons_laws": {
    topic: "Newton's Laws of Motion & Force Vectors",
    matchKeywords: ["newton", "newton's law", "newtons laws", "f=ma", "force vector", "friction", "acceleration", "gravity", "free body diagram", "fbd"],
    diagnosis: "The common misconception is confusing net force with applied force. Acceleration depends strictly on the vector sum $\\vec{F}_{\\text{net}} = \\sum \\vec{F} = \\vec{F}_{\\text{applied}} - \\vec{f}_k$, not applied force alone.",
    answer: "Newton's Laws govern classical kinematics and dynamics:\n1. **1st Law (Inertia)**: An object remains at rest or constant velocity unless acted upon by a non-zero net force ($\\sum \\vec{F} = 0 \\implies \\vec{a} = 0$).\n2. **2nd Law (Force & Acceleration)**: Acceleration is directly proportional to net force and inversely proportional to mass: $$\\vec{F}_{\\text{net}} = m\\vec{a} \\implies \\vec{a} = \\frac{\\vec{F}_{\\text{applied}} - \\mu m g}{m}$$\n3. **3rd Law (Action-Reaction)**: For every action force $\\vec{F}_{A \\to B}$, there is an equal and opposite reaction force $-\\vec{F}_{B \\to A}$.",
    visual_type: "physics_vectors",
    visual_payload: {
      title: "Newton's Laws & Vector Mechanics Simulator",
      visual_type: "physics_vectors"
    },
    smart_notes: {
      formulas: [
        "Newton's 2nd Law: $\\vec{F}_{\\text{net}} = m\\vec{a}$",
        "Gravitational Force: $\\vec{F}_g = m\\vec{g} \\quad (g = 9.8\\,\\text{m/s}^2)$",
        "Normal Force: $\\vec{F}_N = mg\\cos\\theta$",
        "Kinetic Friction: $\\vec{f}_k = \\mu_k \\vec{F}_N = \\mu_k m g$"
      ],
      prerequisites: [
        { title: "Vector Resolution", desc: "Forces along orthogonal X and Y axes must be summed independently: $\\sum F_x = ma_x$ and $\\sum F_y = 0$." }
      ],
      key_takeaways: [
        "Normal force and gravity are NOT an action-reaction pair (they act on the same object).",
        "If $F_{\\text{applied}} \\le f_{\\text{static,max}}$, acceleration is zero ($a = 0$)."
      ],
      pitfalls: [
        "Forgetting friction when calculating acceleration ($a \\ne F_{\\text{applied}} / m$)."
      ]
    },
    followup_questions: [
      "Why aren't normal force and gravitational force an action-reaction pair?",
      "How do force vectors change on an inclined plane with angle $\\theta$?"
    ]
  },

  "recursion_dp": {
    topic: "Recursion & Dynamic Programming Prerequisites",
    matchKeywords: ["recursion", "dynamic programming", "dp", "memoization", "call stack", "base case", "overlapping subproblems"],
    diagnosis: "I noticed you got 3 recursion questions wrong in recent practice. Before continuing with advanced Dynamic Programming, let's strengthen recursion fundamentals first.",
    answer: "Before solving Dynamic Programming problems with memoization, we must solidify the **Recursive Call Stack Invariant**:\n1. **Base Case**: The termination condition that prevents infinite call stack overflow (e.g. $n \\le 1 \\implies \\text{return } n$).\n2. **Recursive Transition**: Breaking $T(n)$ into smaller subproblems $T(n-1) + T(n-2)$.\n3. **Call Stack State**: Each recursive invocation allocates a new stack frame storing local arguments and return addresses until base cases resolve.",
    visual_type: "code_visualization",
    visual_payload: {
      title: "Recursion Call Stack & Memory Frame Execution",
      visual_type: "code_visualization",
      code_title: "Recursive Call Stack Debugger",
      code_lines: [
        "def fibonacci(n):",
        "    if n <= 1:           # Base Case Guard",
        "        return n",
        "    left = fibonacci(n-1) # Push frame (n-1)",
        "    right = fibonacci(n-2)# Push frame (n-2)",
        "    return left + right  # Resolve & pop frame"
      ],
      trace_steps: [
        { line: 1, vars: { n: 4, stack_depth: 1, frame: "fib(4)" }, desc: "Call `fib(4)`: Pushes frame onto Call Stack." },
        { line: 2, vars: { n: 4, is_base: "False" }, desc: "Check base case: $4 \\le 1$ is False. Recurse." },
        { line: 4, vars: { n: 3, stack_depth: 2, frame: "fib(3)" }, desc: "Call `fib(3)`: Stack depth increases to 2." },
        { line: 4, vars: { n: 2, stack_depth: 3, frame: "fib(2)" }, desc: "Call `fib(2)`: Stack depth increases to 3." },
        { line: 2, vars: { n: 1, stack_depth: 4, is_base: "True" }, desc: "🎯 Base Case reached: `fib(1)` returns 1. Pops frame!" }
      ]
    },
    smart_notes: {
      formulas: [
        "Fibonacci Recurrence: $T(n) = T(n-1) + T(n-2) + \\mathcal{O}(1) \\implies \\mathcal{O}(2^n)$",
        "Memoized DP Time: $\\mathcal{O}(n)$",
        "Maximum Stack Depth: $\\mathcal{O}(n)$"
      ],
      prerequisites: [
        { title: "Base Case is Mandatory", desc: "Without a base case, recursion produces a `RecursionError: maximum recursion depth exceeded`." }
      ],
      key_takeaways: [
        "Recursion solves problems top-down by stacking frames.",
        "DP optimizes overlapping recursive calls by caching computed states."
      ],
      pitfalls: [
        "Forgetting to return the base case value."
      ]
    },
    followup_questions: [
      "How does adding a memoization hash table reduce $O(2^n)$ to $O(n)$?",
      "What is the difference between Call Stack depth and iterative space?"
    ]
  }
};

const companionService = {
  /**
   * Submit query to personalized AI companion tutor with Learner Profile Adaptation
   */
  async queryTutor({ sessionId, documentId, question, currentTopic = "General Study", learnerProfile = null }) {
    const normalized = question.toLowerCase();

    // 1. Determine tailored pedagogical rationale based on Learner Profile
    let adaptedRationale = null;
    if (learnerProfile) {
      if (learnerProfile.preferredExplanationStyle === "visual") {
        adaptedRationale = "Pedagogical Strategy: You learn best through visual models. Leading explanation with interactive visual simulations, state charts, and flowchart diagrams.";
      } else if (learnerProfile.preferredExplanationStyle === "fundamentals_first") {
        adaptedRationale = "Pedagogical Strategy: Focusing on foundational prerequisites first ($2^k = n \\iff k = \\log_2 n$) to close identified conceptual gaps before advancing.";
      } else if (learnerProfile.preferredExplanationStyle === "worked_examples") {
        adaptedRationale = "Pedagogical Strategy: You understand concepts well but have made calculation slips. Providing step-by-step worked numerical examples with intermediate sanity-check verification.";
      } else if (learnerProfile.preferredExplanationStyle === "prerequisite_remediation" || normalized.includes("dynamic programming") || normalized.includes("recursion")) {
        adaptedRationale = "Pedagogical Strategy: I noticed you got 3 recursion questions wrong in recent practice. Before continuing with Dynamic Programming, let's strengthen recursion and call stack fundamentals first.";
      }
    }

    // 2. Specialized Conversational Prompts
    if (normalized.includes("explain this more simply") || normalized.includes("simplify") || normalized.includes("beginner")) {
      return {
        answer: `💡 **In Simple Terms:**\n\nImagine looking up a word in a 1,000-page dictionary.\n- **Linear Search**: You read page 1, page 2, page 3... up to page 1,000. (Slow! $\\mathcal{O}(n)$)\n- **Binary Search**: You open right to page 500. If your word starts with "T", you throw away pages 1–500 entirely! Now you have only 500 pages left. Then 250, then 125, then 62, and in just **10 flips**, you find your word.\n\nEvery single comparison cuts the remaining dictionary in half: $$\\frac{n}{2} \\to \\frac{n}{4} \\to \\frac{n}{8} \\dots \\to 1$$`,
        tutorRationale: "Simplification Strategy: Replacing abstract recurrence math with the concrete Dictionary Halving mental model.",
        prerequisiteDiagnosis: "Mental model for logarithmic reduction ($2^{10} = 1024 \\implies 10 \\text{ steps}$)",
        visual_type: "step_by_step_visualization",
        visual_payload: {
          title: "Binary Search",
          visual_type: "step_by_step_visualization",
          array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 84, 91, 98, 105, 120, 142],
          target: 23
        },
        smart_notes: {
          formulas: ["$\\text{Steps} = \\lceil \\log_2 n \\rceil$", "$2^{10} = 1024 \\iff \\log_2 1024 = 10$"],
          prerequisites: [{ title: "Sorted Array Requirement", desc: "Array MUST be sorted ($A[i] \\le A[i+1]$) for halving to work." }],
          key_takeaways: ["Cuts work in half every single step.", "For $1,000,000$ elements, only $20$ comparisons needed!"],
          pitfalls: ["Does NOT work on unsorted arrays."]
        },
        followup_questions: ["Why do we divide by 2?", "Quiz me on this", "Give me a worked example"]
      };
    }

    if (normalized.includes("why do we divide by 2") || normalized.includes("divide by 2")) {
      return {
        answer: `🔍 **Why We Divide by 2:**\n\nBecause the array is **sorted** ($A[i] \\le A[i+1]$), the midpoint $A[mid]$ partitions the array into two equal halves:\n1. If $\\text{target} < A[mid]$, it is **mathematically impossible** for $\\text{target}$ to exist anywhere in the right half ($A[mid..R]$). So we safely eliminate all $n/2$ elements.\n2. If $\\text{target} > A[mid]$, we safely eliminate the left half ($A[L..mid]$).\n\nThis guarantees we discard $50\\%$ of all remaining candidates with **just one single comparison** $\\mathcal{O}(1)$!`,
        tutorRationale: "Explaining the Monotonic Invariant: $A[i] \\le A[mid] \\le A[j]$ allows elimination of half the search space.",
        prerequisiteDiagnosis: "Monotonic Order Invariant ($A[L..mid] \\le A[mid] \\le A[mid..R]$)",
        visual_type: "step_by_step_visualization",
        visual_payload: {
          title: "Binary Search",
          visual_type: "step_by_step_visualization"
        },
        smart_notes: {
          formulas: ["$mid = left + \\lfloor (right - left) / 2 \\rfloor$", "$T(n) = T(n/2) + 1$"],
          prerequisites: [{ title: "Sorted Order", desc: "Monotonicity guarantees all elements to the left are smaller." }],
          key_takeaways: ["1 comparison eliminates 50% of elements.", "Eliminates need to check every item individually."],
          pitfalls: ["Using $(left + right) / 2$ can cause integer overflow in languages like C++ / Java."]
        },
        followup_questions: ["Show me visually", "Give me an example", "Test my understanding"]
      };
    }

    if (normalized.includes("example") || normalized.includes("give me an example")) {
      return {
        answer: `📝 **Step-by-Step Worked Example:**\n\nLet's search for $\\text{target} = 23$ in sorted array:  \n$$A = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 84, 91, 98, 105, 120, 142]$$ ($n = 16$)\n\n- **Step 1**: $L=0, R=15 \\implies mid = 7, A[7]=45$. Since $23 < 45$, eliminate right half. Set $R = 6$.\n- **Step 2**: $L=0, R=6 \\implies mid = 3, A[3]=12$. Since $23 > 12$, eliminate left half. Set $L = 4$.\n- **Step 3**: $L=4, R=6 \\implies mid = 5, A[5]=23$. **Found in only 3 comparisons!**\n\nNotice: $16 \\to 8 \\to 4 \\to \\text{Found}$. Total steps: $3 \\le \\log_2 16 = 4$.`,
        tutorRationale: "Worked Example Strategy: Concrete index calculations and variable updates for L, mid, R.",
        prerequisiteDiagnosis: "Pointer arithmetic ($L \\leftarrow mid+1$ vs $R \\leftarrow mid-1$)",
        visual_type: "code_visualization",
        visual_payload: {
          title: "Binary Search Trace",
          visual_type: "code_visualization"
        },
        smart_notes: {
          formulas: ["$L \\leftarrow mid + 1$", "$R \\leftarrow mid - 1$"],
          prerequisites: [{ title: "Index Boundaries", desc: "Always adjust pointers past mid to avoid infinite loops." }],
          key_takeaways: ["3 steps instead of 6 steps in linear search.", "Pointers strictly converge: $R - L$ decreases exponentially."],
          pitfalls: ["Setting $R = mid$ instead of $R = mid - 1$."]
        },
        followup_questions: ["Quiz me on this", "Why do we divide by 2?", "Explain like I'm a beginner"]
      };
    }

    if (normalized.includes("quiz") || normalized.includes("test me") || normalized.includes("check")) {
      return {
        answer: `🎯 **Quick Understanding Check:**\n\n**Question**: If an array contains $1,048,576$ ($2^{20}$) sorted elements, what is the **maximum** number of comparisons Binary Search will ever need to find any element (or declare it missing)?\n\n- **A)** $1,048,576$ comparisons  \n- **B)** $524,288$ comparisons  \n- **C)** $20$ comparisons  \n- **D)** $100$ comparisons  \n\n*Think: Each step halves the remaining candidates. How many times can you divide $2^{20}$ by $2$ until you reach $1$?*`,
        tutorRationale: "Diagnostic Assessment: Testing whether student connects powers of 2 ($2^{20}$) to worst-case logarithmic search depth ($k = \\log_2 2^{20} = 20$).",
        prerequisiteDiagnosis: "Exponent-Logarithm duality ($2^k = n \\iff k = \\log_2 n$)",
        visual_type: "comparison",
        visual_payload: {
          title: "Linear vs Binary Search",
          visual_type: "comparison"
        },
        smart_notes: {
          formulas: ["$\\log_2 (2^{20}) = 20$", "$T(n) = \\mathcal{O}(\\log_2 n)$"],
          prerequisites: [{ title: "Logarithm Rules", desc: "$\\log_2 (2^k) = k$." }],
          key_takeaways: ["Even with 1 million items, only 20 checks are needed.", "Massive performance gain over Linear Search ($O(n)$)."],
          pitfalls: ["Confusing logarithmic scaling with linear proportions."]
        },
        followup_questions: ["Option C is correct because 2^20 has 20 halvings!", "Explain why Option B is wrong", "Show me visually"]
      };
    }

    if (normalized.includes("linear") || normalized.includes("difference") || normalized.includes("compare")) {
      return {
        answer: `⚖️ **Binary Search vs Linear Search:**\n\n| Attribute | Linear Search | Binary Search |\n| :--- | :--- | :--- |\n| **Time Complexity** | $\\mathcal{O}(n)$ (Linear) | $\\mathcal{O}(\\log n)$ (Logarithmic) |\n| **Array Precondition** | Works on Unsorted Array | Requires **Strictly Sorted** Array |\n| **1,000 Elements** | Up to $1,000$ checks | At most **10 checks** |\n| **1,000,000 Elements** | Up to $1,000,000$ checks | At most **20 checks** |\n| **Strategy** | Sequential scan | Divide and Conquer ($50\\%$ eliminated per step) |`,
        tutorRationale: "Comparative Analysis: Highlighting trade-offs between unconstrained search vs sorted precondition.",
        prerequisiteDiagnosis: "Trade-off evaluation: Sorting cost $\\mathcal{O}(n \\log n)$ vs Search speed $\\mathcal{O}(\\log n)$",
        visual_type: "comparison",
        visual_payload: {
          title: "Linear Search vs Binary Search Trade-offs",
          visual_type: "comparison"
        },
        smart_notes: {
          formulas: ["Linear: $T(n) = \\mathcal{O}(n)$", "Binary: $T(n) = \\mathcal{O}(\\log n)$"],
          prerequisites: [{ title: "Sorting Overhead", desc: "If searching only once in unsorted data, Linear Search ($O(n)$) is faster than Sorting first ($O(n \\log n)$)." }],
          key_takeaways: ["Binary Search scales gracefully to billions of records.", "Linear Search requires zero preprocessing."],
          pitfalls: ["Sorting an array just to do one single search."]
        },
        followup_questions: ["When is Linear Search better than Binary Search?", "Quiz me on time complexity", "Show me visually"]
      };
    }

    if (normalized.includes("visual") || normalized.includes("show me")) {
      return {
        answer: `🎬 **Visualizing the Search Space Shrinkage:**\n\nOpening the interactive **Visual Learning Canvas** now.\n\nNotice how the array is split into:\n- 🟢 **Active Search Interval** $[L..R]$\n- 🟡 **Midpoint Element** $A[mid]$\n- ⚪ **Eliminated Half** (grayed out and removed from consideration)\n\nClick any element in the array or press **Play Animation** to watch the search space halve in real time!`,
        tutorRationale: "Triggering active visual simulation to reinforce spatial memory of interval halving.",
        prerequisiteDiagnosis: "Interval visualization $[L, R]$",
        visual_type: "step_by_step_visualization",
        visual_payload: {
          title: "Binary Search",
          visual_type: "step_by_step_visualization"
        },
        smart_notes: {
          formulas: ["$L = 0, R = n - 1$", "$mid = L + \\lfloor (R - L) / 2 \\rfloor$"],
          prerequisites: [{ title: "Interval Halving", desc: "Size reduces as $n \\to n/2 \\to n/4 \\dots \\to 1$." }],
          key_takeaways: ["Visualizing pointers prevents off-by-one errors.", "Every step cuts the active width exactly in half."],
          pitfalls: ["Loop condition must be $L \\le R$, not $L < R$."]
        },
        followup_questions: ["Why do we divide by 2?", "Give me an example", "Test my understanding"]
      };
    }

    // Check for Student D / Recursion remediation match
    if (learnerProfile?.preferredExplanationStyle === "prerequisite_remediation" && (normalized.includes("dynamic programming") || normalized.includes("dp") || normalized.includes("memoization"))) {
      const preset = TOPIC_PRESETS["recursion_dp"];
      return {
        answer: preset.answer,
        tutorRationale: adaptedRationale || preset.diagnosis,
        prerequisiteDiagnosis: "Recursion Base Case & Call Stack Depth (Must master before Dynamic Programming)",
        visual_type: preset.visual_type,
        visual_payload: preset.visual_payload,
        smart_notes: preset.smart_notes,
        followup_questions: preset.followup_questions,
        sources: []
      };
    }

    // Match against knowledge graph
    for (const [key, preset] of Object.entries(TOPIC_PRESETS)) {
      if (preset.matchKeywords.some(kw => normalized.includes(kw))) {
        return {
          answer: preset.answer,
          tutorRationale: adaptedRationale || `Tailored for ${learnerProfile?.name || 'your profile'}: ${preset.diagnosis}`,
          prerequisiteDiagnosis: preset.diagnosis,
          visual_type: preset.visual_type,
          visual_payload: preset.visual_payload,
          smart_notes: preset.smart_notes,
          followup_questions: preset.followup_questions,
          sources: []
        };
      }
    }

    // Generic fallback
    const defaultPreset = TOPIC_PRESETS["binary_search"];
    return {
      answer: `To understand **${question}**, we examine the foundational invariants. Under divide-and-conquer, the search interval reduces by factor $2$ at each step, yielding $T(n) = T(n/2) + \\mathcal{O}(1) \\implies \\mathcal{O}(\\log_2 n)$.`,
      tutorRationale: adaptedRationale || "Adapting pedagogical strategy to your active learning profile.",
      prerequisiteDiagnosis: defaultPreset.diagnosis,
      visual_type: defaultPreset.visual_type,
      visual_payload: defaultPreset.visual_payload,
      smart_notes: defaultPreset.smart_notes,
      followup_questions: defaultPreset.followup_questions,
      sources: []
    };
  },

  /**
   * Component explanation generator
   */
  async explainComponent(componentData) {
    const { component, formula, role, pdu, protocols, details } = componentData;
    let answer = `Here is the pedagogical breakdown for **${component}**:\n\n`;
    if (role) answer += `**Core Functionality**: ${role}\n\n`;
    if (pdu) answer += `**Protocol Data Unit (PDU)**: \`${pdu}\`\n\n`;
    if (protocols) answer += `**Key Protocols**: ${protocols}\n\n`;
    if (formula) answer += `**Governing Formula**: $${formula}$\n\n`;
    if (details) answer += `${details}\n\n`;

    answer += `Why this matters for your learning path: Mastering this component solidifies the mental model needed for complex multi-layer problems and exams.`;

    return {
      answer,
      tutorRationale: `Inspecting subcomponent ${component}. Tailoring explanation to clarify component mechanics and state interactions.`,
      prerequisiteDiagnosis: `Component inspection: ${component}`,
      followup_questions: [
        `How does ${component} interact with adjacent components?`,
        `What happens if ${component} encounters an error or packet drop?`
      ]
    };
  }
};

export default companionService;
