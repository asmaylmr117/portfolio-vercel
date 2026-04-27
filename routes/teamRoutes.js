const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// GET all team members
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, active, title, search } = req.query;
    const result = await Team.findAll({ page, limit, active, title, search });
    res.json({
      teams: result.rows,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single team member by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdOrSlug(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team member not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new team member
router.post('/', async (req, res) => {
  try {
    const newTeam = await Team.create(req.body);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update team member
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.updateByIdOrSlug(req.params.id, req.body);
    if (!team) return res.status(404).json({ message: 'Team member not found' });
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.deleteByIdOrSlug(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team member not found' });
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET team members by position/title
router.get('/position/:title', async (req, res) => {
  try {
    const teams = await Team.findByTitle(req.params.title);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active team members
router.get('/active/all', async (req, res) => {
  try {
    const teams = await Team.findActive();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST toggle team member status
router.post('/:id/toggle-status', async (req, res) => {
  try {
    const team = await Team.toggleStatus(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team member not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET team statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Team.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;