const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// POST /api/auth/register - Register new admin (only if no admin exists, or by existing admin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
        timestamp: new Date().toISOString()
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        timestamp: new Date().toISOString()
      });
    }

    // Check if admin already exists with this email
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Check if this is the first admin (allow without auth) or requires auth
    const adminCount = await Admin.count();
    if (adminCount > 0) {
      // Require authentication for subsequent admin creation
      const authHeader = req.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
          success: false,
          message: 'Only authenticated admins can create new admin accounts',
          timestamp: new Date().toISOString()
        });
      }

      try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token. Authentication required.',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Create admin
    const admin = await Admin.create({ name, email, password });
    const token = generateToken(admin);

    console.log(`New admin registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token,
        expiresIn: process.env.JWT_EXPIRE || '30d'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        timestamp: new Date().toISOString()
      });
    }

    // Find admin
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isMatch = await Admin.verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Update last login
    await Admin.updateLastLogin(admin.id);

    // Generate token
    const token = generateToken(admin);

    console.log(`Admin logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token,
        expiresIn: process.env.JWT_EXPIRE || '30d'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/auth/me - Get current admin profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
    timestamp: new Date().toISOString()
  });
});

// PUT /api/auth/change-password - Change password (protected)
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
        timestamp: new Date().toISOString()
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
        timestamp: new Date().toISOString()
      });
    }

    // Verify current password
    const admin = await Admin.findByEmail(req.admin.email);
    const isMatch = await Admin.verifyPassword(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        timestamp: new Date().toISOString()
      });
    }

    await Admin.changePassword(req.admin.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
