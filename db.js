const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on('connect', () => {
  console.log('PostgreSQL pool: new client connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// Helper function for queries
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 80), duration, rows: res.rowCount });
  }
  return res;
};

// Initialize all tables
const initDB = async () => {
  try {
    // Blogs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        blog_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        screens TEXT NOT NULL,
        b_single TEXT NOT NULL,
        description TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_title VARCHAR(255) NOT NULL,
        create_at VARCHAR(255) NOT NULL,
        comment VARCHAR(50) DEFAULT '0',
        thumb VARCHAR(255) NOT NULL,
        bl_class VARCHAR(255) DEFAULT 'format-standard-image',
        views INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) UNIQUE NOT NULL,
        p_img TEXT NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        sub TEXT DEFAULT '',
        description TEXT NOT NULL,
        industry VARCHAR(255) DEFAULT '',
        country VARCHAR(255) DEFAULT '',
        technologies1 VARCHAR(255) DEFAULT '',
        technologies2 VARCHAR(255) DEFAULT '',
        thumb1 TEXT DEFAULT '',
        thumb2 TEXT DEFAULT '',
        category VARCHAR(255) DEFAULT 'general',
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(255) UNIQUE NOT NULL,
        s_img TEXT NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        thumb1 TEXT DEFAULT '',
        thumb2 TEXT DEFAULT '',
        col VARCHAR(50) DEFAULT 'col-lg-4',
        description TEXT DEFAULT '',
        features TEXT[] DEFAULT '{}',
        price NUMERIC(10,2) DEFAULT 0,
        duration VARCHAR(255) DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        popular BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Teams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(255) UNIQUE NOT NULL,
        t_img TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        bio TEXT DEFAULT '',
        social_linkedin VARCHAR(500) DEFAULT '',
        social_twitter VARCHAR(500) DEFAULT '',
        social_github VARCHAR(500) DEFAULT '',
        social_website VARCHAR(500) DEFAULT '',
        skills TEXT[] DEFAULT '{}',
        experience INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        join_date TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        subject VARCHAR(200),
        company VARCHAR(100),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'new',
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Admins table (for dashboard authentication)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_blogs_thumb ON blogs(thumb);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_title ON services(title);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_teams_title ON teams(title);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_email_created ON contacts(email, created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`);

    console.log('All PostgreSQL tables and indexes created successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error.message);
    throw error;
  }
};

module.exports = { pool, query, initDB };
