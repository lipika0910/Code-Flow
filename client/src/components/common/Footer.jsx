import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-top py-4 mt-auto" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <div className="container-fluid px-4">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge rounded-2 p-1" style={{ background: 'var(--accent-violet)' }}>
                <i className="bi bi-code-slash text-white"></i>
              </span>
              <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                Code<span style={{ color: 'var(--accent-teal)' }}>Flow</span>
              </span>
              <span className="badge bg-secondary-subtle text-secondary-emphasis" style={{ fontSize: '0.7rem' }}>v1.0.0</span>
            </div>
            <p className="mb-0 text-truncate" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Learn. Experiment. Execute. Understand. Assess.
            </p>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-wrap gap-3 justify-content-md-center" style={{ fontSize: '0.85rem' }}>
              <Link to="/learn" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>Lessons</Link>
              <Link to="/codelab" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>CodeLab</Link>
              <Link to="/codetrace" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>CodeTrace</Link>
              <Link to="/practice" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>Practice</Link>
              <Link to="/assessment" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>Assessments</Link>
            </div>
          </div>

          <div className="col-12 col-md-3 text-md-end">
            <div className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', background: 'var(--status-success)' }}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Browser Sandboxed Runtimes</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
