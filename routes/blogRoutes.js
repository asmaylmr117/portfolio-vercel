const express = require('express');
const router = express.Router();
const Blog = require('../models/Blogs');

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, author, thumb, search } = req.query;
    const result = await Blog.findAll({ page, limit, author, thumb, search, isPublished: true });
    res.json({
      blogs: result.rows,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdOrSlug(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    // Increment views
    const updated = await Blog.incrementViews(req.params.id);
    res.json(updated || blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new blog
router.post('/', async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update blog
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.updateByIdOrSlug(req.params.id, req.body);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.deleteByIdOrSlug(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET blogs by category/thumb
router.get('/category/:thumb', async (req, res) => {
  try {
    const blogs = await Blog.findByThumb(req.params.thumb);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recent blogs
router.get('/recent/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const blogs = await Blog.findRecent(count);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;