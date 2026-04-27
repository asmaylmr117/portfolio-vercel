const express = require('express');
const rateLimit = require('express-rate-limit');
const Contact = require('../models/Contact');

const router = express.Router();

// Rate limiting for contact submissions (stricter than general API)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 submissions per 15 minutes per IP
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many contact submissions. Please try again after 15 minutes.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateContactForm = (req, res, next) => {
  const { name, email, phone, message } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (phone.trim().length > 20) {
    errors.push('Phone number cannot exceed 20 characters');
  }

  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  } else if (message.trim().length > 1000) {
    errors.push('Message cannot exceed 1000 characters');
  }

  if (req.body.subject && req.body.subject.trim().length > 200) {
    errors.push('Subject cannot exceed 200 characters');
  }

  if (req.body.company && req.body.company.trim().length > 100) {
    errors.push('Company name cannot exceed 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please fix the following errors',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// POST /api/contact - Submit contact form
router.post('/', contactLimiter, validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, message, subject, company } = req.body;

    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      ipAddress,
      userAgent
    };

    if (subject && subject.trim()) contactData.subject = subject.trim();
    if (company && company.trim()) contactData.company = company.trim();

    const savedContact = await Contact.create(contactData);

    console.log(`New contact submission from: ${email} at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will contact you soon.',
      data: {
        id: savedContact.id,
        submittedAt: savedContact.createdAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form submission error:', error);

    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A message from this email address has already been submitted',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/contact - Get all contacts (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const result = await Contact.findAll({ page, limit, status });

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(result.total / parseInt(limit)),
        total: result.total,
        limit: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact data',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/contact/:id/status - Update contact status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        timestamp: new Date().toISOString()
      });
    }

    const contact = await Contact.updateStatus(id, status);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact status',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/contact/:id - Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.deleteById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact message',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
