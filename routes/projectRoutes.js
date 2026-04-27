const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, featured, search } = req.query;
    const result = await Project.findAll({ page, limit, category, status, featured, search });
    res.json({
      projects: result.rows,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single project by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdOrSlug(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new project
router.post('/', async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.updateByIdOrSlug(req.params.id, req.body);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.deleteByIdOrSlug(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET projects by category
router.get('/category/:category', async (req, res) => {
  try {
    const projects = await Project.findByCategory(req.params.category);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET featured projects
router.get('/featured/all', async (req, res) => {
  try {
    const projects = await Project.findFeatured();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET projects by status
router.get('/status/:status', async (req, res) => {
  try {
    const projects = await Project.findByStatus(req.params.status);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;