const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * JWT Authentication Middleware for Dashboard routes
 * Verifies the Bearer token from Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
        timestamp: new Date().toISOString()
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but admin account not found or deactivated.',
        timestamp: new Date().toISOString()
      });
    }

    // Attach admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error.',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = authMiddleware;
