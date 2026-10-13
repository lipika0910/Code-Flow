import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const json = await res.json();

      if (json.ok) {
        storage.setUser(json.data.user);
        navigate('/dashboard');
      } else {
        setErrorMessage(json.error.message || 'Registration failed.');
      }
    } catch {
      setErrorMessage('Network error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="cf-card mx-auto p-4 p-md-5" style={{ maxWidth: '440px', background: 'var(--bg-surface-elevated)' }}>
        <div className="text-center mb-4">
          <span className="badge rounded-3 p-2 mb-2" style={{ background: 'var(--accent-teal)', fontSize: '1.2rem' }}>
            <i className="bi bi-person-plus text-dark"></i>
          </span>
          <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create Student Account</h1>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Join CodeFlow to save projects, track assessment scores, and earn XP.
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
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Username *</label>
            <input
              type="text"
              className="form-control"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex_code"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>College Email *</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@college.edu"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Password (Min. 6 chars) *</label>
            <input
              type="password"
              className="form-control"
              required
              minLength={6}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }}>
          <span className="text-secondary">Already registered? </span>
          <Link to="/login" style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>Log In</Link>
          <div className="mt-2">
            <Link to="/dashboard" className="text-muted" style={{ fontSize: '0.8rem' }}>Stay in Guest Mode →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
