import React from 'react';
import { Link } from 'react-router-dom';
import LiveMiniEditor from '../components/common/LiveMiniEditor';

export default function LandingPage() {
  const learningCycle = [
    { step: '1', title: 'LEARN', desc: 'Read structured concept breakdowns with runnable code samples.' },
    { step: '2', title: 'PREDICT', desc: 'Predict execution outcomes before running any code.' },
    { step: '3', title: 'EXECUTE', desc: 'Trigger safe, sandboxed browser execution in iframes & Web Workers.' },
    { step: '4', title: 'OBSERVE', desc: 'Inspect variable states, call stacks, and output discrepancies.' },
    { step: '5', title: 'EXPERIMENT', desc: 'Modify values and test edge cases directly in CodeLab.' },
    { step: '6', title: 'PRACTICE', desc: 'Tackle targeted bug-hunting and statement-reordering drills.' },
    { step: '7', title: 'ASSESS', desc: 'Complete server-graded challenges evaluated against hidden tests.' },
    { step: '8', title: 'IMPROVE', desc: 'Review topic-wise analytics and actionable concept recommendations.' }
  ];

  const topics = [
    { title: 'HTML5 Fundamentals', type: 'Interactive', count: '4 Lessons', icon: 'bi-filetype-html', desc: 'Semantic tags, forms, tables, accessibility, and DOM structure.' },
    { title: 'CSS3 & Modern Layouts', type: 'Interactive', count: '4 Lessons', icon: 'bi-filetype-css', desc: 'Box model, Flexbox, Grid, pseudo-classes, and responsive design.' },
    { title: 'JavaScript Core', type: 'Interactive', count: '5 Lessons', icon: 'bi-filetype-js', desc: 'Variables, types, control flow, functions, scope, and closures.' },
    { title: 'DOM & Event Handling', type: 'Interactive', count: '3 Lessons', icon: 'bi-cursor-fill', desc: 'Query selectors, event listeners, bubbling, and dynamic UI updates.' },
    { title: 'Async JS & Browser APIs', type: 'Interactive', count: '2 Lessons', icon: 'bi-clock-history', desc: 'Promises, fetch API, setTimeout, and local storage.' },
    { title: 'HTML5 Canvas', type: 'Interactive', count: '2 Lessons', icon: 'bi-palette', desc: '2D context, drawing shapes, animation loops, and mouse interaction.' },
    { title: 'Bootstrap 5 Framework', type: 'Read-only', count: '1 Overview', icon: 'bi-bootstrap', desc: 'Grid system, utility classes, and components (Read-only).' },
    { title: 'React Fundamentals', type: 'Read-only', count: '1 Overview', icon: 'bi-atom', desc: 'Component architecture, JSX, props, and state (Read-only).' },
    { title: 'Client-Server & REST APIs', type: 'Read-only', count: '1 Overview', icon: 'bi-hdd-network', desc: 'HTTP methods, status codes, JSON payloads, and headers (Read-only).' },
    { title: 'PHP & MySQL Backends', type: 'Read-only', count: '1 Overview', icon: 'bi-database', desc: 'Server scripts, SQL queries, and relational schemas (Read-only).' }
  ];

  const features = [
    {
      title: 'CodeLab IDE',
      icon: 'bi-code-square',
      desc: 'Browser-based IDE with CodeMirror 6, live iframe preview, Web Worker runtime, and structured console/error diagnosis.',
      link: '/codelab'
    },
    {
      title: 'CodeTrace AST Visualizer',
      icon: 'bi-diagram-3',
      desc: 'Step forward and backward through real JavaScript AST nodes. Watch call stacks, variable scopes, and statement transitions.',
      link: '/codetrace'
    },
    {
      title: 'Practice & Debugging Lab',
      icon: 'bi-bug',
      desc: 'Diagnose syntax, runtime, and logic bugs with staged hints, diff viewer, and automated test verification.',
      link: '/debug'
    },
    {
      title: 'Live DOM Explorer',
      icon: 'bi-diagram-2',
      desc: 'Inspect tree hierarchies, mutate attributes and inline styles in real-time, and dispatch simulated DOM events.',
      link: '/dom-explorer'
    },
    {
      title: 'Predict → Execute → Compare',
      icon: 'bi-bullseye',
      desc: 'Test your mental model against classic JavaScript quirks: type coercion, closure loops, hoisting, and object references.',
      link: '/predict'
    },
    {
      title: 'Assessment Centre',
      icon: 'bi-patch-check',
      desc: 'Timed exams with server-evaluated visible & hidden test cases. Earn XP, avoid point-farming, and review detailed score reports.',
      link: '/assessment'
    },
    {
      title: 'Student Dashboard & Analytics',
      icon: 'bi-graph-up',
      desc: 'Track daily streaks, XP accumulation, completion milestones, and topic-specific accuracy without fake data.',
      link: '/dashboard'
    }

  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="py-5 text-center position-relative overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}>
        <div className="container py-4">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', background: 'var(--accent-teal)' }}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interactive Web Programming Platform</span>
          </div>

          <h1 className="display-4 fw-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)', maxWidth: '900px', margin: '0 auto' }}>
            Learn. Experiment. Execute. <br />
            <span style={{ color: 'var(--accent-violet)' }}>Understand.</span> <span style={{ color: 'var(--accent-teal)' }}>Assess.</span>
          </h1>

          <p className="lead mx-auto mb-4" style={{ maxWidth: '680px', color: 'var(--text-secondary)' }}>
            Students memorize or copy code without understanding how it actually executes. CodeFlow replaces passive copying with real browser execution, guided AST tracing, and rigorous server-side evaluation.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <Link to="/codelab" className="cf-btn-primary">
              <i className="bi bi-play-circle-fill"></i> Launch CodeLab IDE
            </Link>
            <Link to="/learn" className="cf-btn-secondary">
              <i className="bi bi-book"></i> Explore Lessons
            </Link>
            <Link to="/codetrace" className="cf-btn-secondary">
              <i className="bi bi-diagram-3"></i> Step into CodeTrace
            </Link>
          </div>

          {/* Live Runnable Demo */}
          <div className="mx-auto mt-2" style={{ maxWidth: '880px' }}>
            <LiveMiniEditor />
          </div>
        </div>
      </section>

      {/* The 8-Step Pedagogical Learning Cycle */}
      <section className="py-5 border-top border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="cf-badge cf-badge-interactive mb-2">The Pedagogical Engine</span>
            <h2 className="h3 fw-bold" style={{ color: 'var(--text-primary)' }}>The 8-Step CodeFlow Learning Cycle</h2>
            <p className="mx-auto" style={{ maxWidth: '600px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              How CodeFlow bridges the gap between seeing code on a slide and genuinely understanding browser runtime mechanics.
            </p>
          </div>

          <div className="row g-3">
            {learningCycle.map((item) => (
              <div key={item.step} className="col-12 col-sm-6 col-lg-3">
                <div className="cf-card h-100 p-3 d-flex flex-column" style={{ background: 'var(--bg-app)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge rounded-pill" style={{ background: 'var(--accent-violet)', fontSize: '0.8rem' }}>
                      Step {item.step}
                    </span>
                    <i className="bi bi-arrow-right-short" style={{ color: 'var(--accent-teal)', fontSize: '1.2rem' }}></i>
                  </div>
                  <h3 className="h6 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="cf-badge cf-badge-interactive mb-2">Integrated Modules</span>
            <h2 className="h3 fw-bold" style={{ color: 'var(--text-primary)' }}>Designed for College Web Programming</h2>
            <p className="mx-auto" style={{ maxWidth: '550px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Every tool is purpose-built to inspect, simulate, and verify web application concepts.
            </p>
          </div>

          <div className="row g-4">
            {features.map((feat) => (
              <div key={feat.title} className="col-12 col-md-6 col-lg-4">
                <div className="cf-card h-100 d-flex flex-column p-4">
                  <div className="d-inline-flex p-3 rounded-3 mb-3" style={{ background: 'var(--bg-surface-elevated)', width: 'fit-content' }}>
                    <i className={`bi ${feat.icon} fs-4`} style={{ color: 'var(--accent-teal)' }}></i>
                  </div>
                  <h3 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                  <p className="flex-grow-1 mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {feat.desc}
                  </p>
                  <Link to={feat.link} className="text-decoration-none fw-semibold d-inline-flex align-items-center gap-1" style={{ color: 'var(--accent-violet)' }}>
                    Open Module <i className="bi bi-chevron-right fs-7"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topic Overview & Runtime Transparency */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
            <div>
              <span className="cf-badge cf-badge-interactive mb-2">Curriculum Breadth</span>
              <h2 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Supported Topics & Runtimes</h2>
              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Clear distinction between interactive runnable sandboxes and read-only conceptual topics.
              </p>
            </div>
            <div className="d-flex gap-2">
              <span className="cf-badge cf-badge-interactive">Interactive: Iframe & Worker</span>
              <span className="cf-badge cf-badge-readonly">Read-only: Reference</span>
            </div>
          </div>

          <div className="row g-3">
            {topics.map((t) => (
              <div key={t.title} className="col-12 col-md-6 col-lg-4">
                <div className="cf-card p-3 h-100" style={{ background: 'var(--bg-app)' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${t.icon} fs-5`} style={{ color: t.type === 'Interactive' ? 'var(--accent-teal)' : 'var(--text-muted)' }}></i>
                      <h3 className="h6 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>
                    </div>
                    <span className={`cf-badge ${t.type === 'Interactive' ? 'cf-badge-interactive' : 'cf-badge-readonly'}`} style={{ fontSize: '0.68rem' }}>
                      {t.type}
                    </span>
                  </div>
                  <p className="mb-2 text-secondary" style={{ fontSize: '0.8rem' }}>{t.desc}</p>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{t.count}</span>
                    <Link to="/learn" className="text-decoration-none" style={{ color: 'var(--accent-violet)' }}>
                      View syllabus →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-5 text-center" style={{ background: 'radial-gradient(circle at 50% 100%, rgba(20, 184, 166, 0.12) 0%, transparent 60%)' }}>
        <div className="container py-3">
          <h2 className="display-6 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to understand how your web code really runs?
          </h2>
          <p className="lead mx-auto mb-4" style={{ maxWidth: '600px', color: 'var(--text-secondary)' }}>
            No setup, no external installations required. Start in Guest Mode or launch CodeLab immediately.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/codelab" className="cf-btn-primary btn-lg">
              <i className="bi bi-play-circle-fill"></i> Launch CodeLab Now
            </Link>
            <Link to="/dashboard" className="cf-btn-secondary btn-lg">
              <i className="bi bi-speedometer2"></i> View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
