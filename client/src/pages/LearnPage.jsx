import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_TOPICS, FALLBACK_LESSONS } from '../services/curriculumData';

export default function LearnPage() {
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const completedLessons = storage.getLessonProgress();

  useEffect(() => {
    async function loadCurriculum() {
      try {
        const [topRes, lesRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/lessons')
        ]);
        const topJson = await topRes.json();
        const lesJson = await lesRes.json();

        if (topJson.ok && lesJson.ok) {
          setTopics(topJson.data);
          setLessons(lesJson.data);
        } else {
          setTopics(FALLBACK_TOPICS);
          setLessons(FALLBACK_LESSONS);
        }
      } catch (err) {
        setTopics(FALLBACK_TOPICS);
        setLessons(FALLBACK_LESSONS);
      } finally {
        setLoading(false);
      }
    }

    loadCurriculum();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary">Loading curriculum syllabus...</p>
      </div>
    );
  }

  // Calculate completion percentage
  const totalCore = lessons.filter(l => l.is_interactive).length;
  const completedCoreCount = lessons.filter(l => l.is_interactive && completedLessons.includes(l.id)).length;
  const progressPercent = totalCore > 0 ? Math.round((completedCoreCount / totalCore) * 100) : 0;

  return (
    <div className="container py-4">
      {/* Banner */}
      <div className="cf-card-elevated mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge" style={{ background: 'var(--accent-violet)' }}>Interactive Syllabus</span>
          <span className="cf-badge cf-badge-interactive">10 Topics • 18 Lessons</span>
        </div>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Curriculum & Core Lessons
        </h1>
        <p className="mb-3 text-secondary" style={{ fontSize: '0.9rem' }}>
          Explore structured lessons designed to clarify execution order, DOM mechanics, and browser asynchronous behaviour.
        </p>

        {/* Global Progress Bar */}
        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Core Interactive Syllabus Completion</span>
          <span className="fw-semibold" style={{ color: 'var(--accent-teal)' }}>{completedCoreCount} / {totalCore} Lessons ({progressPercent}%)</span>
        </div>
        <div className="progress" style={{ height: '8px', background: 'var(--bg-app)' }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progressPercent}%`, background: 'var(--accent-teal)' }}
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      {/* Topics & Lesson Cards */}
      <div className="d-flex flex-column gap-4">
        {topics.map(topic => {
          const topicLessons = lessons.filter(l => l.topic_id === topic.id);
          const isInteractive = topic.category === 'interactive';

          return (
            <div key={topic.id} className="cf-card p-4">
              {/* Topic Header */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${topic.icon} fs-4`} style={{ color: isInteractive ? 'var(--accent-teal)' : 'var(--text-muted)' }}></i>
                  <div>
                    <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{topic.title}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{topic.description}</span>
                  </div>
                </div>

                <span className={`cf-badge ${isInteractive ? 'cf-badge-interactive' : 'cf-badge-readonly'}`}>
                  {isInteractive ? 'Interactive' : 'Read-only — not executable in CodeFlow'}
                </span>
              </div>

              {/* Lessons Grid for Topic */}
              <div className="row g-3">
                {topicLessons.map(lesson => {
                  const isDone = completedLessons.includes(lesson.id) || lesson.is_completed;

                  return (
                    <div key={lesson.id} className="col-12 col-md-6">
                      <div className="p-3 rounded-3 h-100 d-flex flex-column" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className={`badge ${lesson.difficulty === 'Beginner' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ fontSize: '0.7rem' }}>
                            {lesson.difficulty}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <i className="bi bi-clock me-1"></i>{lesson.estimated_time}
                          </span>
                        </div>

                        <h3 className="h6 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {lesson.title}
                        </h3>

                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                          {isDone ? (
                            <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-check-circle-fill"></i> Completed
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Incomplete</span>
                          )}

                          <Link to={`/learn/${lesson.slug}`} className="cf-btn-primary btn-sm py-1 px-3" style={{ fontSize: '0.8rem' }}>
                            {isDone ? 'Review' : 'Start Lesson'} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
