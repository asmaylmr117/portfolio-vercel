const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import routes
const blogRoutes = require('./routes/blogRoutes');
const projectRoutes = require('./routes/projectRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const teamRoutes = require('./routes/teamRoutes');
const contactRoutes = require('./routes/contactRoutes'); // Add contact routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://software-company-mu.vercel.app'],
    },
  },
})); // Secure headers with Content Security Policy
app.use(compression()); // Compress responses for performance
app.use(cors({
  origin: 'https://software-company-mu.vercel.app', // Allow only frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 100, // Max requests
  keyGenerator: (req) => req.get('X-API-Key') || req.ip, // Use API key or IP
  message: 'Too many requests from this source',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API key authentication middleware
const apiKeyAuth = (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer'); // Check request origin
  const allowedOrigin = 'https://software-company-mu.vercel.app';

  // Allow requests from the frontend without API key
  if (origin && origin.startsWith(allowedOrigin)) {
    console.log(`Access granted for frontend origin: ${origin}`);
    return next();
  }

  // Require API key for other sources (e.g., Postman)
  const apiKey = req.get('X-API-Key');
  if (!apiKey) {
    console.warn(`Access attempt without API key from IP: ${req.ip}, Origin: ${origin || 'unknown'}`);
    return res.status(401).json({
      message: 'API key is missing',
      timestamp: new Date().toISOString()
    });
  }

  if (apiKey !== process.env.API_SECRET) {
    console.warn(`Access attempt with invalid API key from IP: ${req.ip}, Origin: ${origin || 'unknown'}`);
    return res.status(401).json({
      message: 'Invalid API key',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`API key verified from IP: ${req.ip}, Origin: ${origin || 'unknown'}`);
  next();
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://software-company-mu.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

let cachedConnection = null;

// Connect to MongoDB
const connectDB = async () => {
  if (cachedConnection) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_ATLAS_URI) {
      throw new Error('MONGODB_ATLAS_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
      dbName: 'portfolio',
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 3,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error.message);
    throw error;
  }
};

mongoose.connection.on('connected', () => console.log('Mongoose connected to MongoDB Atlas'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected from MongoDB Atlas'));

// Apply API key middleware to sensitive routes
app.use('/api/blogs', apiKeyAuth, blogRoutes);
app.use('/api/projects', apiKeyAuth, projectRoutes);
app.use('/api/services', apiKeyAuth, serviceRoutes);
app.use('/api/teams', apiKeyAuth, teamRoutes);

// Contact route - Special handling for POST requests from frontend
app.use('/api/contact', (req, res, next) => {
  // Allow POST requests from frontend without API key for contact form submission
  if (req.method === 'POST') {
    const origin = req.get('Origin') || req.get('Referer');
    const allowedOrigin = 'https://software-company-mu.vercel.app';
    
    if (origin && origin.startsWith(allowedOrigin)) {
      console.log(`Contact form submission allowed from frontend: ${origin}`);
      return next(); // Skip API key check for frontend POST requests
    }
  }
  
  // Apply API key authentication for all other methods (GET, PUT, DELETE) or external sources
  return apiKeyAuth(req, res, next);
}, contactRoutes);

// Health check endpoint (unprotected for monitoring)
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    let dbTest = 'unknown';
    try {
      await mongoose.connection.db.admin().ping();
      dbTest = 'responsive';
    } catch (error) {
      dbTest = 'unresponsive';
    }

    res.json({
      status: 'OK',
      message: 'Server is running on Vercel',
      database: {
        status: dbStatusText[dbStatus],
        test: dbTest,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint (unprotected)
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Backend API',
    version: '1.0.0',
    endpoints: {
      blogs: '/api/blogs',
      projects: '/api/projects',
      services: '/api/services',
      teams: '/api/teams',
      contact: '/api/contact', // Added contact endpoint
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
    timestamp: new Date().toISOString()
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Export for Vercel
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};

// Run server locally in development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Contact API: http://localhost:${PORT}/api/contact`);
    });
  });
}
