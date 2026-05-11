const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const { pool, initDB } = require('./db');

const blogRoutes = require('./routes/blogRoutes');
const projectRoutes = require('./routes/projectRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const teamRoutes = require('./routes/teamRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Origins ثابتة
const allowedOrigins = [
  'https://software-company-mu.vercel.app',
  'https://portfolio-admin-ashy-psi.vercel.app',
  'https://portfolio-vercel-bi43.vercel.app',
];

// ✅ Patterns للـ preview URLs الديناميكية
const allowedPatterns = [
  /^https:\/\/portfolio-vercel-bi43[a-z0-9-]*\.vercel\.app$/,
  /^https:\/\/portfolio-admin-ashy-psi[a-z0-9-]*\.vercel\.app$/,
  /^https:\/\/software-company-mu[a-z0-9-]*\.vercel\.app$/,
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (allowedPatterns.some(pattern => pattern.test(origin))) return true;
  return false;
};

// ✅ CORS headers - دي الدالة الأساسية اللي بتتشغل أول حاجة في كل request
const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    // لو origin معروف، بنحط الـ origin بالظبط مع credentials
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // لو مفيش origin (direct API call) نسمح
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  // لو origin موجود بس مش في الـ list، vercel.json هيحط * كـ fallback
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key, Cache-Control, Pragma');
  res.setHeader('Access-Control-Max-Age', '86400');
};

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: { connectSrc: ["*"] },
  },
}));
app.use(compression());

// ✅ CORS middleware - أول middleware بعد helmet
app.use((req, res, next) => {
  applyCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 100,
  message: 'Too many requests from this source',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ✅ API Key Auth
const apiKeyAuth = (req, res, next) => {
  const origin = req.headers.origin;

  if (isOriginAllowed(origin)) {
    console.log(`Access granted for frontend origin: ${origin}`);
    return next();
  }

  const apiKey = req.get('X-API-Key');
  const expectedKey = process.env.API_SECRET;

  if (!apiKey) {
    console.warn(`Access attempt without API key from IP: ${req.ip}, Origin: ${origin || 'unknown'}`);
    return res.status(401).json({
      message: 'API key is missing',
      timestamp: new Date().toISOString()
    });
  }

  if (apiKey !== expectedKey) {
    console.warn(`Access attempt with invalid API key from IP: ${req.ip}`);
    return res.status(401).json({
      message: 'Invalid API key',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`API key verified successfully from IP: ${req.ip}`);
  next();
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// ✅ Singleton DB connection
let dbInitialized = false;
let dbInitPromise = null;

const connectDB = async () => {
  if (dbInitialized) return;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }
      await pool.query('SELECT 1');
      await initDB();
      dbInitialized = true;
      console.log('DB initialized successfully');
    } catch (error) {
      dbInitPromise = null;
      dbInitialized = false;
      console.error('PostgreSQL connection error:', error.message);
      throw error;
    }
  })();

  return dbInitPromise;
};

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasApiSecret: !!process.env.API_SECRET
  });
});

app.get('/api/debug-key', (req, res) => {
  const receivedKey = req.get('X-API-Key');
  const expectedKey = process.env.API_SECRET;
  res.json({
    status: 'Debug API Key Information',
    environment: process.env.NODE_ENV || 'development',
    request: {
      hasApiKeyHeader: !!receivedKey,
      apiKeyLength: receivedKey ? receivedKey.length : 0,
    },
    server: {
      hasExpectedKey: !!expectedKey,
      expectedKeyLength: expectedKey ? expectedKey.length : 0,
    },
    comparison: {
      exactMatch: receivedKey === expectedKey,
    },
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', apiKeyAuth, blogRoutes);
app.use('/api/projects', apiKeyAuth, projectRoutes);
app.use('/api/services', apiKeyAuth, serviceRoutes);
app.use('/api/teams', apiKeyAuth, teamRoutes);

app.use('/api/contact', (req, res, next) => {
  if (req.method === 'POST') {
    const origin = req.get('Origin') || req.get('Referer');
    if (origin && isOriginAllowed(origin)) {
      return next();
    }
  }
  return apiKeyAuth(req, res, next);
}, contactRoutes);

app.get('/api/health', async (req, res) => {
  try {
    let dbStatus = 'unknown';
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }
    res.json({
      status: 'OK',
      database: { type: 'PostgreSQL (Neon)', status: dbStatus },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasApiSecret: !!process.env.API_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message, timestamp: new Date().toISOString() });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Backend API',
    version: '1.0.0',
    endpoints: {
      auth: { login: '/api/auth/login', register: '/api/auth/register', me: '/api/auth/me' },
      blogs: '/api/blogs',
      projects: '/api/projects',
      services: '/api/services',
      teams: '/api/teams',
      contact: '/api/contact',
      health: '/api/health',
    },
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const gracefulShutdown = async () => {
  try {
    await pool.end();
    console.log('PostgreSQL connection pool closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ✅ Vercel Serverless Export
// CORS headers بتتحط في 3 أماكن للضمان:
// 1. vercel.json headers (CDN level - قبل ما الكود يشتغل)
// 2. applyCorsHeaders() جوه express middleware
// 3. هنا قبل connectDB مباشرة
module.exports = async (req, res) => {
  // ① CORS فوراً - أول حاجة قبل أي كود
  applyCorsHeaders(req, res);

  // ② الـ preflight يرجع فوراً من غير DB
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // ③ DB connection
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return res.status(503).json({
      message: 'Service temporarily unavailable, please try again in a moment',
      timestamp: new Date().toISOString()
    });
  }

  return app(req, res);
};

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('- API_SECRET:', !!process.env.API_SECRET ? 'SET' : 'NOT SET');
      console.log('- DATABASE_URL:', !!process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    });
  });
}
