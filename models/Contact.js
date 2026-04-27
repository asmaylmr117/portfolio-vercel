const { query } = require('../db');

const mapRow = (row) => {
  if (!row) return null;
  const mapped = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    company: row.company,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  // Virtual contactInfo
  mapped.contactInfo = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    company: row.company,
    message: row.message,
    status: row.status,
    submittedAt: row.created_at,
  };
  return mapped;
};

const Contact = {
  async create(data) {
    const r = await query(
      `INSERT INTO contacts (name,email,phone,subject,company,message,status,ip_address,user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [data.name, data.email, data.phone, data.subject||null, data.company||null, data.message, data.status||'new', data.ipAddress||null, data.userAgent||null]
    );
    return mapRow(r.rows[0]);
  },
  async findAll({ page = 1, limit = 10, status } = {}) {
    const conditions = []; const params = []; let pi = 1;
    if (status && status !== 'all') { conditions.push(`status = $${pi++}`); params.push(status); }
    const wh = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dq = `SELECT id,name,email,phone,subject,company,message,status,created_at,updated_at FROM contacts ${wh} ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi++}`;
    params.push(parseInt(limit), parseInt(offset));
    const cp = params.slice(0, params.length - 2);
    const [dr, cr] = await Promise.all([query(dq, params), query(`SELECT COUNT(*) FROM contacts ${wh}`, cp)]);
    return { rows: dr.rows.map(mapRow), total: parseInt(cr.rows[0].count) };
  },
  async updateStatus(id, status) {
    const r = await query(
      `UPDATE contacts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id,name,email,phone,subject,company,message,status,created_at,updated_at`,
      [status, parseInt(id)]
    );
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },
  async deleteById(id) {
    const r = await query(`DELETE FROM contacts WHERE id = $1 RETURNING *`, [parseInt(id)]);
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },
};

module.exports = Contact;
