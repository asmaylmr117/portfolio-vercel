const { query } = require('../db');
const bcrypt = require('bcryptjs');

const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Admin = {
  // Create admin with hashed password
  async create({ name, email, password, role = 'admin' }) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const r = await query(
      `INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email.toLowerCase(), hashedPassword, role]
    );
    return mapRow(r.rows[0]);
  },

  // Find by email (includes password for login verification)
  async findByEmail(email) {
    const r = await query(
      `SELECT * FROM admins WHERE email = $1 AND is_active = true`,
      [email.toLowerCase()]
    );
    if (r.rows.length === 0) return null;
    // Return full row including password for verification
    return { ...mapRow(r.rows[0]), password: r.rows[0].password };
  },

  // Find by ID (no password)
  async findById(id) {
    const r = await query(
      `SELECT * FROM admins WHERE id = $1 AND is_active = true`,
      [parseInt(id)]
    );
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Update last login
  async updateLastLogin(id) {
    await query(
      `UPDATE admins SET last_login = NOW(), updated_at = NOW() WHERE id = $1`,
      [parseInt(id)]
    );
  },

  // Change password
  async changePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await query(
      `UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, parseInt(id)]
    );
  },

  // Get all admins
  async findAll() {
    const r = await query(
      `SELECT id, name, email, role, is_active, last_login, created_at, updated_at FROM admins ORDER BY created_at DESC`
    );
    return r.rows.map(mapRow);
  },

  // Check if any admin exists (for initial setup)
  async count() {
    const r = await query(`SELECT COUNT(*) FROM admins`);
    return parseInt(r.rows[0].count);
  },
};

module.exports = Admin;
