import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = 'bi-inbox', title, message, actionText, actionLink, onAction }) {
  return (
    <div className="cf-card text-center py-5 px-4 my-3" style={{ background: 'var(--bg-surface-elevated)' }}>
      <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
        <i className={`bi ${icon} fs-2`} style={{ color: 'var(--text-muted)' }}></i>
      </div>
      <h3 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="mx-auto mb-4" style={{ maxWidth: '420px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {message}
      </p>
      {actionLink && (
        <Link to={actionLink} className="cf-btn-primary btn-sm">
          {actionText || 'Get Started'}
        </Link>
      )}
      {onAction && !actionLink && (
        <button onClick={onAction} className="cf-btn-primary btn-sm">
          {actionText || 'Get Started'}
        </button>
      )}
    </div>
  );
}
