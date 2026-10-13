import express from 'express';
import db from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All project endpoints require authentication (guest mode uses localStorage)
router.use(requireAuth);

// GET /api/projects - list user's projects
router.get('/', async (req, res) => {
  try {
    const projects = await db('projects')
      .where({ user_id: req.user.id })
      .orderBy('updated_at', 'desc');

    res.json({
      ok: true,
      data: projects
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/projects - create new project
router.post('/', async (req, res) => {
  const { name, description, html_code, css_code, js_code, runtime_mode } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Project name is required.' }
    });
  }

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const newProject = {
      id: projectId,
      user_id: req.user.id,
      name,
      description: description || '',
      html_code: html_code || '',
      css_code: css_code || '',
      js_code: js_code || '',
      runtime_mode: runtime_mode || 'web'
    };

    await db('projects').insert(newProject);

    // Save Initial Version (v1)
    await db('project_versions').insert({
      id: `ver_${Date.now()}`,
      project_id: projectId,
      version_number: 1,
      name: 'Initial Creation',
      html_code: newProject.html_code,
      css_code: newProject.css_code,
      js_code: newProject.js_code
    });

    res.status(201).json({
      ok: true,
      data: newProject
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/projects/:id - get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await db('projects')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!project) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Project not found or unauthorized.' }
      });
    }

    res.json({
      ok: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// PATCH /api/projects/:id - update project and record version
router.patch('/:id', async (req, res) => {
  try {
    const project = await db('projects')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!project) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Project not found or unauthorized.' }
      });
    }

    const { name, description, html_code, css_code, js_code } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (html_code !== undefined) updates.html_code = html_code;
    if (css_code !== undefined) updates.css_code = css_code;
    if (js_code !== undefined) updates.js_code = js_code;
    updates.updated_at = new Date().toISOString();

    await db('projects').where({ id: project.id }).update(updates);

    // Increment version count
    const lastVersion = await db('project_versions')
      .where({ project_id: project.id })
      .orderBy('version_number', 'desc')
      .first();

    const nextVerNum = lastVersion ? lastVersion.version_number + 1 : 1;

    await db('project_versions').insert({
      id: `ver_${Date.now()}`,
      project_id: project.id,
      version_number: nextVerNum,
      name: `Revision ${nextVerNum}`,
      html_code: updates.html_code !== undefined ? updates.html_code : project.html_code,
      css_code: updates.css_code !== undefined ? updates.css_code : project.css_code,
      js_code: updates.js_code !== undefined ? updates.js_code : project.js_code
    });

    const updatedProject = await db('projects').where({ id: project.id }).first();
    res.json({
      ok: true,
      data: updatedProject
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// DELETE /api/projects/:id - delete project
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('projects')
      .where({ id: req.params.id, user_id: req.user.id })
      .del();

    if (!deleted) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' }
      });
    }

    res.json({
      ok: true,
      data: { message: 'Project deleted successfully.' }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/projects/:id/duplicate - duplicate project
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await db('projects')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!original) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Original project not found.' }
      });
    }

    const copyId = `proj_${Date.now()}_copy`;
    const copyProject = {
      id: copyId,
      user_id: req.user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      html_code: original.html_code,
      css_code: original.css_code,
      js_code: original.js_code,
      runtime_mode: original.runtime_mode
    };

    await db('projects').insert(copyProject);
    res.status(201).json({
      ok: true,
      data: copyProject
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// GET /api/projects/:id/versions - get version history
router.get('/:id/versions', async (req, res) => {
  try {
    const project = await db('projects')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!project) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' }
      });
    }

    const versions = await db('project_versions')
      .where({ project_id: project.id })
      .orderBy('version_number', 'desc');

    res.json({
      ok: true,
      data: versions
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

// POST /api/projects/:id/restore/:versionId - restore project to earlier version
router.post('/:id/restore/:versionId', async (req, res) => {
  try {
    const project = await db('projects')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!project) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' }
      });
    }

    const targetVersion = await db('project_versions')
      .where({ id: req.params.versionId, project_id: project.id })
      .first();

    if (!targetVersion) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Version not found.' }
      });
    }

    await db('projects').where({ id: project.id }).update({
      html_code: targetVersion.html_code,
      css_code: targetVersion.css_code,
      js_code: targetVersion.js_code,
      updated_at: new Date().toISOString()
    });

    const restored = await db('projects').where({ id: project.id }).first();
    res.json({
      ok: true,
      data: restored
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
});

export default router;
