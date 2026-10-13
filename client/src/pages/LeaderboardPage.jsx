import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = storage.getUser();
  const currentXP = storage.getXP();
  const streak = storage.getStreak();

  // Level formula: Level = Math.floor(Math.sqrt(XP / 100)) + 1
  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevel = calculateLevel(currentXP);

  // XP needed for next level: nextLevel = currentLevel + 1 => XP = (currentLevel)^2 * 100
  const currentLevelBaseXP = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  const progressInLevel = Math.min(100, Math.max(0, Math.round(((currentXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP || 1)) * 100)));

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/progress/leaderboard');
        if (!res.ok) throw new Error('Failed to fetch leaderboard data.');
        const body = await res.json();

        let list = body.data || [];

        // If current user is a guest with XP, insert them authentically into the leaderboard
        if (currentUser.isGuest) {
          const guestEntry = {
            id: 'guest',
            username: 'You (Guest Student)',
            display_name: 'Local Browser Guest',
            xp: currentXP,
            level: currentLevel,
            isCurrent: true
          };

          // Filter out existing guest if any and insert sorted
          list = [...list.filter(u => u.id !== 'guest'), guestEntry].sort((a, b) => b.xp - a.xp);
        } else {
          list = list.map(u => ({
            ...u,
            isCurrent: u.id === currentUser.id
          }));
        }

        setLeaderboard(list);
      } catch (err) {
        setError(err.message);
        // Fallback to local user
        setLeaderboard([
          {
            id: 'local',
            username: currentUser.username || 'You (Student)',
            display_name: 'Current Learner',
            xp: currentXP,
            level: currentLevel,
            isCurrent: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [currentXP, currentLevel, currentUser.id, currentUser.isGuest, currentUser.username]);

  return (
    <div className="container py-4 px-3 px-lg-4">
      {/* Page Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-md-8">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge rounded-pill" style={{ background: 'var(--accent-amber)', color: '#000', fontWeight: 'bold' }}>
              <i className="bi bi-trophy me-1"></i> Academic Leaderboard & XP
            </span>
            <span className="badge bg-secondary">Genuine Ranks</span>
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Student Standing & Gamification
          </h1>
          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Earn XP through active coding, lesson completions, and passing assessments. Ranks reflect authentic recorded performance.
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
          <div className="d-inline-flex align-items-center gap-3 p-2 rounded" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Streak</div>
              <div className="fw-bold d-flex align-items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
                <i className="bi bi-fire"></i>
                <span>{streak.count} {streak.count === 1 ? 'Day' : 'Days'}</span>
              </div>
            </div>
            <div className="vr" style={{ borderColor: 'var(--border-subtle)' }}></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Total XP</div>
              <div className="fw-bold" style={{ color: 'var(--accent-teal)' }}>
                {currentXP} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Leaderboard Table */}
        <div className="col-12 col-lg-8">
          <div className="cf-card p-3 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <i className="bi bi-bar-chart-steps" style={{ color: 'var(--accent-violet)' }}></i>
                <span>Student Rankings</span>
              </h2>
              <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                Sorted by Total XP
              </span>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>Loading academic leaderboard...</div>
              </div>
            ) : error && leaderboard.length === 0 ? (
              <div className="alert alert-warning py-2 mb-0" style={{ fontSize: '0.85rem' }}>
                {error}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                  <thead>
                    <tr style={{ borderColor: 'var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Student</th>
                      <th className="text-center">Level</th>
                      <th className="text-end">Total XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((student, idx) => {
                      const rank = idx + 1;
                      const isTop3 = rank <= 3;
                      const isCurrent = Boolean(student.isCurrent);

                      return (
                        <tr
                          key={student.id || idx}
                          style={{
                            borderColor: 'var(--border-subtle)',
                            background: isCurrent ? 'var(--bg-surface-elevated)' : 'transparent',
                            fontWeight: isCurrent ? 'bold' : 'normal'
                          }}
                        >
                          {/* Rank */}
                          <td>
                            {rank === 1 ? (
                              <span className="badge bg-warning text-dark px-2 py-1">🥇 1</span>
                            ) : rank === 2 ? (
                              <span className="badge bg-secondary text-light px-2 py-1">🥈 2</span>
                            ) : rank === 3 ? (
                              <span className="badge px-2 py-1" style={{ background: '#cd7f32', color: '#fff' }}>🥉 3</span>
                            ) : (
                              <span className="text-muted ps-2" style={{ fontSize: '0.9rem' }}>#{rank}</span>
                            )}
                          </td>

                          {/* Student Info */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  background: isCurrent ? 'var(--accent-violet)' : 'var(--bg-surface-elevated)',
                                  color: isCurrent ? '#fff' : 'var(--accent-teal)',
                                  border: '1px solid var(--border-subtle)',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <i className="bi bi-person-fill"></i>
                              </div>
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <span style={{ fontSize: '0.9rem' }}>
                                    {student.display_name || student.username}
                                  </span>
                                  {isCurrent && (
                                    <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>
                                      You
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  @{student.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Level */}
                          <td className="text-center">
                            <span className="badge bg-dark border" style={{ borderColor: 'var(--border-subtle)' }}>
                              Lvl {student.level || calculateLevel(student.xp)}
                            </span>
                          </td>

                          {/* Total XP */}
                          <td className="text-end">
                            <span className="fw-bold" style={{ color: 'var(--accent-teal)' }}>
                              {student.xp} XP
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Level Formula & XP Economics */}
        <div className="col-12 col-lg-4">
          {/* Level Progress Card */}
          <div className="cf-card p-3 mb-3">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-shield-check" style={{ color: 'var(--accent-teal)' }}></i>
              <span>Your Level Progression</span>
            </h2>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fw-bold" style={{ fontSize: '1.2rem', color: 'var(--accent-violet)' }}>
                Level {currentLevel}
              </span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Next: Level {currentLevel + 1} ({nextLevelXP} XP)
              </span>
            </div>

            <div className="progress mb-2" style={{ height: '8px', background: 'var(--bg-app)' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progressInLevel}%`, background: 'var(--accent-teal)' }}
                aria-valuenow={progressInLevel}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            <div className="d-flex justify-content-between text-muted mb-3" style={{ fontSize: '0.75rem' }}>
              <span>{currentXP} XP</span>
              <span>{nextLevelXP - currentXP} XP needed to level up</span>
            </div>

            <div className="p-2 rounded" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Mathematical Formula:</strong>
              <div className="font-monospace mt-1" style={{ color: 'var(--accent-amber)', fontSize: '0.75rem' }}>
                Level = ⌊√(XP / 100)⌋ + 1
              </div>
              <p className="mb-0 mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                Each level requires progressively more XP, rewarding sustained academic consistency.
              </p>
            </div>
          </div>

          {/* XP Reward Structure */}
          <div className="cf-card p-3">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-gem" style={{ color: 'var(--accent-amber)' }}></i>
              <span>XP Reward Structure</span>
            </h2>
            <div className="list-group list-group-flush gap-1">
              {[
                { action: 'Complete a Lesson', reward: '+25 XP', icon: 'bi-journal-check', color: 'var(--accent-teal)' },
                { action: 'Correct Quiz Knowledge Check', reward: '+10 XP', icon: 'bi-check-circle', color: 'var(--accent-violet)' },
                { action: 'Pass an Assessment', reward: '+50–100 XP', icon: 'bi-patch-check', color: 'var(--accent-amber)' },
                { action: 'Diagnose Bug in Debugging Lab', reward: '+10–25 XP', icon: 'bi-bug', color: '#0dcaf0' },
                { action: 'Maintain Daily Active Streak', reward: 'Multiplier', icon: 'bi-fire', color: '#dc3545' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="list-group-item d-flex align-items-center justify-content-between p-2 rounded border-0"
                  style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.85rem' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${item.icon}`} style={{ color: item.color }}></i>
                    <span style={{ color: 'var(--text-primary)' }}>{item.action}</span>
                  </div>
                  <span className="fw-bold" style={{ color: item.color }}>
                    {item.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
