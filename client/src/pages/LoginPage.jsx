import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const json = await res.json();

      if (json.ok) {
        storage.setUser(json.data.user);
        navigate('/dashboard');
      } else {
        setErrorMessage(json.error.message || 'Invalid username or password.');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="cf-card mx-auto p-4 p-md-5" style={{ maxWidth: '440px', background: 'var(--bg-surface-elevated)' }}>
        <div className="text-center mb-4">
          <span className="badge rounded-3 p-2 mb-2" style={{ background: 'var(--accent-violet)', fontSize: '1.2rem' }}>
            <i className="bi bi-code-slash text-white"></i>
          </span>
          <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Sign in to CodeFlow</h1>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Access your synchronized projects, assessment records, and curriculum progress.
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-exclamation-octagon-fill"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Username or Email</label>
            <input
              type="text"
              className="form-control"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. student@codeflow.edu"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cf-btn-primary w-100 justify-content-center py-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }}>
          <span className="text-secondary">Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>Create Account</Link>
          <div className="mt-2">
            <Link to="/dashboard" className="text-muted" style={{ fontSize: '0.8rem' }}>Continue in Guest Mode →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
