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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // تعطيل CSP للـ Vercel
}));
app.use(compression());

// CORS configuration - السماح لجميع النطاقات
app.use(cors({
  origin: true, // السماح لجميع النطاقات
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // لدعم المتصفحات القديمة
}));

// إضافة headers إضافية للتأكد من السماح للجميع
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  // الاستجابة للـ preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rate limiting - أقل تشدداً للـ production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: process.env.NODE_ENV === 'production' ? 200 : 100, // 200 طلب في الإنتاج
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files serving - السماح لجميع النطاقات
app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // السماح للجميع
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // سنة واحدة
  next();
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// MongoDB Atlas Connection - محسن للـ serverless مع إعادة المحاولة
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_ATLAS_URI) {
      throw new Error('MONGODB_ATLAS_URI environment variable is not set');
    }

    if (mongoose.connections[0].readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true
      // ❌ bufferMaxEntries تمت إزالتها لأنها غير مدعومة
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error.message);
    console.error('Full error:', error);

    if (process.env.NODE_ENV === 'production') {
      console.log('Attempting to reconnect in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};


// تنفيذ الاتصال
connectDB();

// مراقبة أحداث قاعدة البيانات
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/teams', teamRoutes);

// Health check محسن
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // اختبار سريع لقاعدة البيانات
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Backend API',
    version: '1.0.0',
    endpoints: {
      blogs: '/api/blogs',
      projects: '/api/projects',
      services: '/api/services',
      teams: '/api/teams',
      health: '/api/health'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // تسجيل مفصل للأخطاء في التطوير
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error details:', err);
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
    timestamp: new Date().toISOString()
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown - مهم للـ serverless
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
};

// Event listeners للإغلاق الآمن
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server (للتشغيل المحلي فقط)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export للـ Vercel
module.exports = app;
