import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import GuestBanner from './components/common/GuestBanner';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CodeLabPage from './pages/CodeLabPage';
import CodeTracePage from './pages/CodeTracePage';
import PredictComparePage from './pages/PredictComparePage';
import PracticePage from './pages/PracticePage';
import AssessmentCenterPage from './pages/AssessmentCenterPage';
import AssessmentTakePage from './pages/AssessmentTakePage';
import AssessmentResultPage from './pages/AssessmentResultPage';
import LearnPage from './pages/LearnPage';
import LessonDetailPage from './pages/LessonDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DebuggingLabPage from './pages/DebuggingLabPage';
import DomExplorerPage from './pages/DomExplorerPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';

function NotFoundPage() {
  return (
    <div className="container py-5">
      <div className="cf-card mx-auto text-center py-5 px-4" style={{ maxWidth: '600px' }}>
        <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
          <i className="bi bi-exclamation-triangle fs-2" style={{ color: 'var(--accent-violet)' }}></i>
        </div>
        <h2 className="h4 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>404 — Page Not Found</h2>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>The page you requested could not be found.</p>
        <Link to="/" className="cf-btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--bg-app)' }}>
      <GuestBanner />
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:slug" element={<LessonDetailPage />} />
          <Route path="/codelab" element={<CodeLabPage />} />
          <Route path="/codetrace" element={<CodeTracePage />} />
          <Route path="/debug" element={<DebuggingLabPage />} />
          <Route path="/dom-explorer" element={<DomExplorerPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/predict" element={<PredictComparePage />} />
          <Route path="/assessment" element={<AssessmentCenterPage />} />
          <Route path="/assessment/:id/take" element={<AssessmentTakePage />} />
          <Route path="/assessment/:id/result" element={<AssessmentResultPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

