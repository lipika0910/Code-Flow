import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../services/storage';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const user = storage.getUser();
  const xp = storage.getXP();

  const navLinks = [
    { to: '/learn', label: 'Learn', icon: 'bi-journal-code' },
    { to: '/codelab', label: 'CodeLab', icon: 'bi-code-square' },
    { to: '/codetrace', label: 'CodeTrace', icon: 'bi-diagram-3' },
    { to: '/debug', label: 'Debug Lab', icon: 'bi-bug' },
    { to: '/dom-explorer', label: 'DOM', icon: 'bi-diagram-2' },
    { to: '/practice', label: 'Practice', icon: 'bi-lightning-charge' },
    { to: '/predict', label: 'Predict', icon: 'bi-arrow-left-right' },
    { to: '/assessment', label: 'Assessments', icon: 'bi-patch-check' },
    { to: '/projects', label: 'Projects', icon: 'bi-folder2-open' },
    { to: '/leaderboard', label: 'Ranks', icon: 'bi-trophy' },
    { to: '/analytics', label: 'Analytics', icon: 'bi-graph-up' },
    { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' }
  ];

  if (user.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin', icon: 'bi-shield-lock' });
  }

  return (
    <nav className="navbar navbar-expand-lg border-bottom sticky-top py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <div className="container-fluid px-3 px-lg-4">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-4" to="/">
          <span className="badge rounded-3 p-2" style={{ background: 'var(--accent-violet)', fontSize: '1rem' }}>
            <i className="bi bi-code-slash text-white"></i>
          </span>
          <div className="d-flex flex-column">
            <span className="fw-bold lh-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontSize: '1.25rem' }}>
              Code<span style={{ color: 'var(--accent-teal)' }}>Flow</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              ACADEMIC RUNTIME
            </span>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0 shadow-none text-light"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          style={{ color: 'var(--text-primary)' }}
        >
          <i className={`bi bi-${isOpen ? 'x-lg' : 'list'} fs-4`} style={{ color: 'var(--text-primary)' }}></i>
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="cfNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            {navLinks.map(link => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `nav-link px-3 py-1 rounded d-flex align-items-center gap-2 text-decoration-none transition-all ${
                      isActive ? 'fw-semibold' : ''
                    }`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent'
                  })}
                >
                  <i className={`bi ${link.icon}`} style={{ fontSize: '0.9rem', color: 'var(--accent-violet)' }}></i>
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right Action Items */}
          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0">
            {/* XP Badge */}
            <span className="cf-badge cf-badge-xp d-flex align-items-center gap-1" title="Earned XP">
              <i className="bi bi-star-fill text-warning"></i>
              <span>{xp} XP</span>
            </span>

            {/* Guest / User Badge */}
            <span className="badge px-2 py-1" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              <i className="bi bi-person-circle me-1"></i>
              {user.isGuest ? 'Guest' : user.username}
            </span>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-2 rounded"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle light/dark theme"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', width: '34px', height: '34px' }}
            >
              <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
