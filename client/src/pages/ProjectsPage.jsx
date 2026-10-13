import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectMode, setNewProjectMode] = useState('web');

  // Version History Modal
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [versionsList, setVersionsList] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Load Projects from API (with localStorage fallback for Guest mode)
  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.ok) {
        setProjects(json.data);
      } else {
        loadGuestProjects();
      }
    } catch {
      loadGuestProjects();
    } finally {
      setLoading(false);
    }
  };

  const loadGuestProjects = () => {
    try {
      const data = JSON.parse(localStorage.getItem('cf_projects')) || [
        {
          id: 'proj_guest_default',
          name: 'My First Web Page',
          description: 'Starter DOM project created in guest mode',
          html_code: '<h1>Hello from CodeFlow!</h1>\n<p>Interactive full-stack web project.</p>',
          css_code: 'body { font-family: sans-serif; color: #8b5cf6; }',
          js_code: 'console.log("Guest project loaded successfully");',
          runtime_mode: 'web',
          updated_at: new Date().toISOString()
        }
      ];
      setProjects(data);
    } catch {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const projectPayload = {
      name: newProjectName,
      description: newProjectDesc,
      html_code: '<h1>New CodeFlow Project</h1>\n<p>Ready to build!</p>',
      css_code: 'body { font-family: sans-serif; }',
      js_code: 'console.log("Project created!");',
      runtime_mode: newProjectMode
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload)
      });
      const json = await res.json();
      if (json.ok) {
        setProjects(prev => [json.data, ...prev]);
      } else {
        createGuestProject(projectPayload);
      }
    } catch {
      createGuestProject(projectPayload);
    }

    setCreateModalOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const createGuestProject = (payload) => {
    const newProj = {
      ...payload,
      id: `proj_${Date.now()}`,
      updated_at: new Date().toISOString()
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    localStorage.setItem('cf_projects', JSON.stringify(updated));
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }

    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('cf_projects', JSON.stringify(updated));
  };

  // Duplicate Project
  const handleDuplicateProject = async (proj) => {
    try {
      const res = await fetch(`/api/projects/${proj.id}/duplicate`, { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setProjects(prev => [json.data, ...prev]);
        return;
      }
    } catch {
      // Local fallback
    }

    const copy = {
      ...proj,
      id: `proj_${Date.now()}_copy`,
      name: `${proj.name} (Copy)`,
      updated_at: new Date().toISOString()
    };
    const updated = [copy, ...projects];
    setProjects(updated);
    localStorage.setItem('cf_projects', JSON.stringify(updated));
  };

  // Open Version History
  const handleOpenVersions = async (proj) => {
    setActiveProject(proj);
    setVersionsModalOpen(true);
    setSelectedVersion(null);

    try {
      const res = await fetch(`/api/projects/${proj.id}/versions`);
      const json = await res.json();
      if (json.ok) {
        setVersionsList(json.data);
        if (json.data.length > 0) setSelectedVersion(json.data[0]);
        return;
      }
    } catch {
      // Local fallback versions
    }

    setVersionsList([
      {
        id: 'v1',
        version_number: 1,
        name: 'Initial Creation',
        html_code: proj.html_code,
        css_code: proj.css_code,
        js_code: proj.js_code,
        saved_at: proj.updated_at
      }
    ]);
  };

  // Restore Version
  const handleRestoreVersion = async (version) => {
    if (!window.confirm(`Restore project to version ${version.version_number}? Current code will be replaced.`)) return;

    try {
      await fetch(`/api/projects/${activeProject.id}/restore/${version.id}`, { method: 'POST' });
    } catch {
      // Local fallback
    }

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          html_code: version.html_code,
          css_code: version.css_code,
          js_code: version.js_code,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    setProjects(updated);
    localStorage.setItem('cf_projects', JSON.stringify(updated));
    setVersionsModalOpen(false);
    alert('Project restored successfully to ' + version.name);
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="cf-card-elevated mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge" style={{ background: 'var(--accent-violet)' }}>Project Workspace</span>
            <span className="cf-badge cf-badge-interactive">Versioned Code Storage</span>
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Saved Projects</h1>
          <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
            Create and maintain web applications with revision history, version diffs, and CodeLab integration.
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="cf-btn-primary">
          <i className="bi bi-plus-lg"></i> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="cf-card p-5 text-center">
          <i className="bi bi-folder2-open fs-1 text-muted mb-3 d-block"></i>
          <h2 className="h5 fw-bold text-light mb-2">No Projects Saved Yet</h2>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
            Create your first HTML/CSS/JavaScript project or duplicate templates in CodeLab.
          </p>
          <button onClick={() => setCreateModalOpen(true)} className="cf-btn-primary">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {projects.map(proj => (
            <div key={proj.id} className="col-12 col-md-6 col-lg-4">
              <div className="cf-card h-100 d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="cf-badge cf-badge-interactive" style={{ fontSize: '0.68rem' }}>
                    {proj.runtime_mode === 'web' ? 'Web Application' : 'JS Worker'}
                  </span>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-link text-muted p-0" type="button" data-bs-toggle="dropdown">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-dark shadow" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <li>
                        <button className="dropdown-item" onClick={() => handleDuplicateProject(proj)}>
                          <i className="bi bi-copy me-2"></i> Duplicate
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={() => handleOpenVersions(proj)}>
                          <i className="bi bi-clock-history me-2"></i> Version History
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border-subtle)' }} /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={() => handleDeleteProject(proj.id)}>
                          <i className="bi bi-trash3 me-2"></i> Delete Project
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="h5 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{proj.name}</h3>
                <p className="text-secondary mb-3 flex-grow-1" style={{ fontSize: '0.85rem' }}>
                  {proj.description || 'No description provided.'}
                </p>

                <div className="pt-2 border-top d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Updated {new Date(proj.updated_at).toLocaleDateString()}</span>
                  <Link to="/codelab" className="cf-btn-primary btn-sm py-1 px-3" style={{ fontSize: '0.78rem' }}>
                    Open in CodeLab →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                <h5 className="modal-title fw-bold">Create New Project</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCreateModalOpen(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="modal-body py-3 d-flex flex-column gap-3">
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Project Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. My Interactive Web Card"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Brief summary of the application..."
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Runtime Environment</label>
                    <select
                      className="form-select"
                      value={newProjectMode}
                      onChange={(e) => setNewProjectMode(e.target.value)}
                      style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                      <option value="web">Web Page (HTML / CSS / JavaScript Preview)</option>
                      <option value="js">Standalone JavaScript (Web Worker Thread)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button type="button" className="cf-btn-secondary btn-sm" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="cf-btn-primary btn-sm">
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionsModalOpen && activeProject && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-clock-history me-2 text-violet"></i>
                  Version History: {activeProject.name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setVersionsModalOpen(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body py-3">
                <div className="row g-3">
                  {/* Versions List */}
                  <div className="col-12 col-md-5 border-end" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="fw-semibold text-muted d-block mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>
                      Revisions ({versionsList.length})
                    </span>
                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '350px' }}>
                      {versionsList.map(ver => (
                        <button
                          key={ver.id}
                          onClick={() => setSelectedVersion(ver)}
                          className={`btn btn-sm text-start p-2 rounded ${
                            selectedVersion?.id === ver.id ? 'btn-primary' : 'btn-outline-secondary'
                          }`}
                          style={{
                            background: selectedVersion?.id === ver.id ? 'var(--accent-violet)' : 'transparent',
                            borderColor: 'var(--border-subtle)',
                            color: selectedVersion?.id === ver.id ? '#fff' : 'var(--text-primary)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div className="fw-semibold">Version {ver.version_number}: {ver.name}</div>
                          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                            {new Date(ver.saved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ver.saved_at).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Snapshot Preview */}
                  <div className="col-12 col-md-7">
                    <span className="fw-semibold text-muted d-block mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>
                      Snapshot Preview
                    </span>
                    {selectedVersion ? (
                      <div>
                        <div className="p-3 rounded font-mono overflow-auto mb-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', maxHeight: '280px', fontSize: '0.78rem' }}>
                          <span className="text-teal d-block mb-1">// HTML Content:</span>
                          <pre className="mb-2 text-light">{selectedVersion.html_code || '(empty)'}</pre>
                          <span className="text-info d-block mb-1">// JavaScript:</span>
                          <pre className="mb-0 text-light">{selectedVersion.js_code || '(empty)'}</pre>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(selectedVersion)}
                          className="cf-btn-teal btn-sm w-100 justify-content-center"
                        >
                          <i className="bi bi-arrow-counterclockwise"></i> Restore This Version
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted fst-italic">Select a version to inspect code snapshot.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" className="cf-btn-secondary btn-sm" onClick={() => setVersionsModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
