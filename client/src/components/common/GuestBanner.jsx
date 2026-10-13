import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(false);
  const user = storage.getUser();

  if (!user.isGuest || dismissed) {
    return null;
  }

  return (
    <div
      className="px-3 py-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2"
      style={{
        background: 'rgba(139, 92, 246, 0.08)',
        borderColor: 'rgba(139, 92, 246, 0.25)',
        fontSize: '0.85rem'
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-info-circle-fill" style={{ color: 'var(--accent-violet)' }}></i>
        <span style={{ color: 'var(--text-primary)' }}>
          <strong>Guest Mode Active:</strong> Your progress, code snippets, and XP are saved locally in your browser's localStorage. Data will not sync across other devices.
        </span>
      </div>
      <div className="d-flex align-items-center gap-2 ms-auto">
        <Link to="/register" className="btn btn-sm py-0 px-2 fw-medium" style={{ background: 'var(--accent-violet)', color: '#fff', fontSize: '0.8rem' }}>
          Create Account
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="btn btn-sm btn-link p-0 text-decoration-none"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Dismiss guest banner"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}
