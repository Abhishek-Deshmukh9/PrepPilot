# PrepPilot Refactor & Upgrade Changelog

## 🌟 Overview of Enhancements

PrepPilot has been overhauled to provide a clean, pedagogically sound, and student-first learning environment for studying any academic PDF or course material. Heavy, complex legacy UI components and bloated local machine learning dependencies have been replaced with modern, fast, cloud-native services.

---

## 1. 🧠 AI Companion & Chat Redesign ("Ask AI Anything")

- **5 Adaptive Socratic Tutor Modes**:
  - 🎓 **Socratic**: Guides students step-by-step with leading questions rather than giving away immediate answers.
  - 📖 **Direct**: Precise, textbook-quality definitions and LaTeX equations.
  - ⚡ **Exam Cram**: High-yield key takeaway bullet points and formulas.
  - 💡 **ELI5**: Real-world analogies and intuitive, jargon-free explanations.
  - 📝 **Worked Example**: Numbered, step-by-step calculations and derivations with intermediate checks.
- **Document-Grounded RAG with Interactive Citations**:
  - Collapsible source citations show exact page numbers and relevance scores from the uploaded PDF chunks.
- **Visual Canvas Panel**:
  - Drawer-style visualizer for LaTeX derivations, flowcharts, and diagrams. Hidden by default for distraction-free reading, and auto-opens when visual explanations are generated.
- **Quick-Start & Contextual Follow-up Chips**:
  - Dynamic subject-agnostic suggestion chips for rapid query starters and intelligent next steps.

---

## 2. ⚡ New Feature: Key Points Extractor (`/keypoints`)

- **Frontend Interface (`KeyPointsPage.jsx`)**:
  - Categorized, priority-ranked key concept cards (**Critical 🔴 / High 🟡 / Medium 🔵 / Low ⚪**).
  - Mathematical LaTeX rendering, real-world examples, and memory tips.
  - Priority filter chips and search bar for quick navigation.
- **Navigation Integration**:
  - Added to sidebar navigation, dashboard quick actions, and router (`/keypoints`).

---

## 3. 🚀 Zero-GPU Cloud-Native Architecture

- **Eliminated PyTorch & Transformers Bloat**:
  - Replaced heavy multi-gigabyte CPU/GPU tensor libraries (`torch`, `sentence-transformers`, `transformers`) with Google Gemini's **`gemini-embedding-001`** cloud embeddings.
  - Installed in seconds with zero dedicated GPU requirement.
- **Precompiled Binary Vector Storage**:
  - Updated ChromaDB to `>=0.5.23` with prebuilt Windows binary wheels (`abi3`), avoiding any requirement for Microsoft C++ Build Tools.
- **Updated Gemini Models**:
  - LLM Model: `gemini-3.5-flash`
  - Embedding Model: `gemini-embedding-001`
- **Forced `.env` Configuration Precedence**:
  - Implemented `load_dotenv(override=True)` to prevent stale OS shell environment variables from overriding `.env` configuration.

---

## 4. 🛠️ Study Tools & Service Layer Bug Fixes

- **Bold Markdown Parsing Fix (`RevisionPage.jsx`)**:
  - Fixed a regex bug (`\*\"` vs `\*\*`) that caused bold Markdown syntax to render as raw asterisks.
- **Header Regenerate Buttons**:
  - Added quick refresh/regenerate actions to both `SummaryPage.jsx` and `RevisionPage.jsx`.
- **Automatic Document Polling (`DocumentContext.jsx`)**:
  - Added a 3-second background polling loop while documents are in `processing` status so the UI transitions to `ready` automatically without page refreshes.
- **Dynamic API Base URL (`api.js`)**:
  - Implemented request interceptor to dynamically fetch custom backend URLs configured in the Settings page from `localStorage`.

---

## 5. 🧪 Verification & Test Results

- **Backend Unit Tests**: 3/3 passed (`pytest tests/`)
- **FastAPI Core**: Validated and initialized cleanly (`app.main:app`)
- **Frontend Build**: 100% successful build with Vite (3897 modules transformed)
