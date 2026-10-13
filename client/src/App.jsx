import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar navbar-expand-lg border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <span className="badge rounded-pill" style={{ background: 'var(--accent-violet)', fontSize: '0.9rem' }}>
            <i className="bi bi-code-slash text-white"></i>
          </span>
          <span className="fw-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontSize: '1.25rem' }}>
            Code<span style={{ color: 'var(--accent-teal)' }}>Flow</span>
          </span>
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          <NavLink to="/learn" className={({ isActive }) => `text-decoration-none px-2 py-1 ${isActive ? 'fw-bold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            Learn
          </NavLink>
          <NavLink to="/codelab" className={({ isActive }) => `text-decoration-none px-2 py-1 ${isActive ? 'fw-bold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            CodeLab
          </NavLink>
          <NavLink to="/codetrace" className={({ isActive }) => `text-decoration-none px-2 py-1 ${isActive ? 'fw-bold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            CodeTrace
          </NavLink>
          <NavLink to="/practice" className={({ isActive }) => `text-decoration-none px-2 py-1 ${isActive ? 'fw-bold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            Practice
          </NavLink>
          <NavLink to="/assessment" className={({ isActive }) => `text-decoration-none px-2 py-1 ${isActive ? 'fw-bold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            Assessments
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `text-decoration-none px-2 py-1 ${isActive ? 'fw-bold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            Dashboard
          </NavLink>
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="container py-5 text-center">
      <div className="py-4">
        <span className="cf-badge cf-badge-interactive mb-3">Interactive Web Programming</span>
        <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Learn. Experiment. Execute. Understand. Assess.
        </h1>
        <p className="lead mx-auto mb-4" style={{ maxWidth: '650px', color: 'var(--text-secondary)' }}>
          Stop copying code without understanding how it runs. CodeFlow teaches through real runtime execution, guided AST code tracing, and server-graded assessment.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/codelab" className="cf-btn-primary">
            <i className="bi bi-play-circle-fill"></i> Launch CodeLab
          </Link>
          <Link to="/learn" className="cf-btn-secondary">
            <i className="bi bi-book"></i> Explore Lessons
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, description, linkTo, linkText }) {
  return (
    <div className="container py-5">
      <div className="cf-card mx-auto text-center py-5" style={{ maxWidth: '600px' }}>
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
      <Header />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<PlaceholderPage title="Interactive Lessons" description="Core lessons spanning HTML, CSS, JavaScript, DOM and browser APIs." linkTo="/codelab" linkText="Open CodeLab" />} />
          <Route path="/codelab" element={<PlaceholderPage title="CodeLab IDE" description="Full-featured in-browser IDE with live sandboxed preview and Worker execution." linkTo="/codetrace" linkText="Open CodeTrace" />} />
          <Route path="/codetrace" element={<PlaceholderPage title="CodeTrace" description="Guided step-by-step AST execution with variable watch and call stack." linkTo="/practice" linkText="Go to Practice" />} />
          <Route path="/practice" element={<PlaceholderPage title="Practice Arena" description="Targeted coding challenges, bug hunting, and output prediction." linkTo="/assessment" linkText="Go to Assessments" />} />
          <Route path="/assessment" element={<PlaceholderPage title="Assessment Centre" description="Timed and untimed rigorous assessments with server-side grading." linkTo="/dashboard" linkText="Go to Dashboard" />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Student Dashboard" description="Track your XP, streak, completed lessons, and skill analytics." linkTo="/learn" linkText="Start Learning" />} />
          <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" description="The page you requested could not be found." linkTo="/" linkText="Back to Home" />} />
        </Routes>
      </main>
      <footer className="py-3 border-top text-center" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        CodeFlow &copy; 2026 — Interactive Web Programming Learning & Assessment Platform
      </footer>
    </div>
  );
}
