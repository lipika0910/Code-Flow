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

function PlaceholderPage({ title, description, linkTo, linkText, icon = 'bi-cone-striped' }) {
  return (
    <div className="container py-5">
      <div className="cf-card mx-auto text-center py-5 px-4" style={{ maxWidth: '600px' }}>
        <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
          <i className={`bi ${icon} fs-2`} style={{ color: 'var(--accent-violet)' }}></i>
        </div>
        <h2 className="h4 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        {linkTo && (
          <Link to={linkTo} className="cf-btn-primary">
            {linkText || 'Continue'}
          </Link>
        )}
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
          <Route path="/learn" element={<PlaceholderPage title="Interactive Lessons" description="Structured curriculum for HTML5, CSS3, JavaScript Core, DOM and APIs." linkTo="/codelab" linkText="Open CodeLab" icon="bi-journal-code" />} />
          <Route path="/learn/:slug" element={<PlaceholderPage title="Lesson Detail" description="Interactive lesson workspace with guided examples and knowledge checks." linkTo="/learn" linkText="Back to Syllabus" icon="bi-journal-text" />} />
          <Route path="/codelab" element={<CodeLabPage />} />
          <Route path="/codetrace" element={<CodeTracePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/predict" element={<PredictComparePage />} />
          <Route path="/assessment" element={<AssessmentCenterPage />} />
          <Route path="/assessment/:id/take" element={<AssessmentTakePage />} />
          <Route path="/assessment/:id/result" element={<AssessmentResultPage />} />
          <Route path="/projects" element={<PlaceholderPage title="My Saved Projects" description="Saved HTML/CSS/JS experiments with revision history and diff viewer." linkTo="/codelab" linkText="Create in CodeLab" icon="bi-folder2-open" />} />
          <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" description="The page you requested could not be found." linkTo="/" linkText="Back to Home" icon="bi-exclamation-triangle" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
