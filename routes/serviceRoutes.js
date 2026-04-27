const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET all services
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, active, popular, search } = req.query;
    const result = await Service.findAll({ page, limit, active, popular, search });
    res.json({
      services: result.rows,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single service by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdOrSlug(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new service
router.post('/', async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.updateByIdOrSlug(req.params.id, req.body);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.deleteByIdOrSlug(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET popular services
router.get('/popular/all', async (req, res) => {
  try {
    const services = await Service.findPopular();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active services
router.get('/active/all', async (req, res) => {
  try {
    const services = await Service.findActive();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST toggle service status
router.post('/:id/toggle-status', async (req, res) => {
  try {
    const service = await Service.toggleStatus(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;