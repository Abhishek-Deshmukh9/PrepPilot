import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DocumentProvider } from "./contexts/DocumentContext";
import AppShell from "./components/layout/AppShell";

// Page imports
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import SummaryPage from "./pages/SummaryPage";
import KeyPointsPage from "./pages/KeyPointsPage";
import MCQPage from "./pages/MCQPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import InterviewPage from "./pages/InterviewPage";
import RevisionPage from "./pages/RevisionPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <DocumentProvider>
          <Routes>
            {/* ── Standalone landing page (no AppShell) ── */}
            <Route path="/" element={<LandingPage />} />

            {/* ── App shell wraps all interior routes ──── */}
            <Route
              path="/*"
              element={
                <AppShell>
                  <Routes>
                    <Route path="/dashboard"  element={<Dashboard />} />
                    <Route path="/upload"     element={<UploadPage />} />
                    <Route path="/chat"       element={<ChatPage />} />
                    <Route path="/summary"    element={<SummaryPage />} />
                    <Route path="/keypoints"  element={<KeyPointsPage />} />
                    <Route path="/mcqs"       element={<MCQPage />} />
                    <Route path="/flashcards" element={<FlashcardsPage />} />
                    <Route path="/interview"  element={<InterviewPage />} />
                    <Route path="/revision"   element={<RevisionPage />} />
                    <Route path="/history"    element={<HistoryPage />} />
                    <Route path="/settings"   element={<SettingsPage />} />
                  </Routes>
                </AppShell>
              }
            />
          </Routes>
        </DocumentProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
