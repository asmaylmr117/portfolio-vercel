const { query } = require('../db');

const mapRow = (row) => {
  if (!row) return null;
  return {
    Id: row.service_id,
    _id: row.id,
    sImg: row.s_img,
    title: row.title,
    slug: row.slug,
    thumb1: row.thumb1,
    thumb2: row.thumb2,
    col: row.col,
    description: row.description,
    features: row.features || [],
    price: parseFloat(row.price) || 0,
    duration: row.duration,
    isActive: row.is_active,
    popular: row.popular,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Service = {
  async findAll({ page = 1, limit = 10, active, popular, search } = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(active === 'true' || active === true);
    }
    if (popular !== undefined) {
      conditions.push(`popular = $${paramIndex++}`);
      params.push(popular === 'true' || popular === true);
    }
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR $${paramIndex} = ANY(features))`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM services ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, params.length - 2);
    const countQuery = `SELECT COUNT(*) FROM services ${whereClause}`;

    const [dataRes, countRes] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, countParams),
    ]);

    return {
      rows: dataRes.rows.map(mapRow),
      total: parseInt(countRes.rows[0].count),
    };
  },

  async findByIdOrSlug(identifier) {
    const res = await query(
      `SELECT * FROM services WHERE service_id = $1 OR slug = $1`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  async create(data) {
    const res = await query(
      `INSERT INTO services (service_id, s_img, title, slug, thumb1, thumb2, col, description, features, price, duration, is_active, popular)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        data.Id, data.sImg, data.title, data.slug,
        data.thumb1 || '', data.thumb2 || '', data.col || 'col-lg-4',
        data.description || '', data.features || [],
        data.price || 0, data.duration || '',
        data.isActive !== undefined ? data.isActive : true,
        data.popular || false,
      ]
    );
    return mapRow(res.rows[0]);
  },

  async updateByIdOrSlug(identifier, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    const fieldMap = {
      sImg: 's_img', title: 'title', slug: 'slug', thumb1: 'thumb1',
      thumb2: 'thumb2', col: 'col', description: 'description',
      features: 'features', price: 'price', duration: 'duration',
      isActive: 'is_active', popular: 'popular',
    };

    for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
      if (data[jsKey] !== undefined) {
        fields.push(`${dbCol} = $${paramIndex++}`);
        params.push(data[jsKey]);
      }
    }

    if (fields.length === 0) return this.findByIdOrSlug(identifier);

    fields.push(`updated_at = NOW()`);
    params.push(identifier);

    const res = await query(
      `UPDATE services SET ${fields.join(', ')} WHERE service_id = $${paramIndex} OR slug = $${paramIndex} RETURNING *`,
      params
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  async deleteByIdOrSlug(identifier) {
    const res = await query(
      `DELETE FROM services WHERE service_id = $1 OR slug = $1 RETURNING *`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  async findPopular() {
    const res = await query(
      `SELECT * FROM services WHERE popular = true AND is_active = true ORDER BY created_at DESC`
    );
    return res.rows.map(mapRow);
  },

  async findActive() {
    const res = await query(
      `SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC`
    );
    return res.rows.map(mapRow);
  },

  async toggleStatus(identifier) {
    const res = await query(
      `UPDATE services SET is_active = NOT is_active, updated_at = NOW() WHERE service_id = $1 OR slug = $1 RETURNING *`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },
};

module.exports = Service;
