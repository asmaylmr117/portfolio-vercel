
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
    message: 'تم تجاوز الحد المسموح للرسائل. يرجى المحاولة مرة أخرى بعد 15 دقيقة.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateContactForm = (req, res, next) => {
  const { name, email, phone, message } = req.body;
  const errors = [];

  // Required fields validation
  if (!name || name.trim().length === 0) {
    errors.push('الاسم مطلوب');
  } else if (name.trim().length > 100) {
    errors.push('الاسم لا يجب أن يتجاوز 100 حرف');
  }

  if (!email || email.trim().length === 0) {
    errors.push('البريد الإلكتروني مطلوب');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('يرجى إدخال بريد إلكتروني صحيح');
    }
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('رقم الهاتف مطلوب');
  } else if (phone.trim().length > 20) {
    errors.push('رقم الهاتف لا يجب أن يتجاوز 20 رقم');
  }

  if (!message || message.trim().length === 0) {
    errors.push('الرسالة مطلوبة');
  } else if (message.trim().length > 1000) {
    errors.push('الرسالة لا يجب أن تتجاوز 1000 حرف');
  }

  // Optional fields validation
  if (req.body.subject && req.body.subject.trim().length > 200) {
    errors.push('الموضوع لا يجب أن يتجاوز 200 حرف');
  }

  if (req.body.company && req.body.company.trim().length > 100) {
    errors.push('اسم الشركة لا يجب أن يتجاوز 100 حرف');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'يرجى تصحيح الأخطاء التالية',
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

    // Get client info
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Create new contact entry
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      ipAddress,
      userAgent
    };

    // Add optional fields if provided
    if (subject && subject.trim()) {
      contactData.subject = subject.trim();
    }

    if (company && company.trim()) {
      contactData.company = company.trim();
    }

    const contact = new Contact(contactData);
    const savedContact = await contact.save();

    console.log(`New contact submission from: ${email} at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'لقد تم إرسال البيانات بنجاح! سنتواصل معك قريباً.',
      data: {
        id: savedContact._id,
        submittedAt: savedContact.createdAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form submission error:', error);

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'يرجى تصحيح البيانات المدخلة',
        errors: validationErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Handle duplicate email (if we add unique constraint later)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'تم إرسال رسالة من هذا البريد الإلكتروني مسبقاً',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/contact - Get all contacts (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-ipAddress -userAgent');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في استرجاع البيانات',
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
        message: 'حالة غير صحيحة',
        timestamp: new Date().toISOString()
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-ipAddress -userAgent');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'الرسالة غير موجودة',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة الرسالة بنجاح',
      data: contact,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث الحالة',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/contact/:id - Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'الرسالة غير موجودة',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الرسالة بنجاح',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف الرسالة',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
