const { query } = require('../db');

const mapRow = (row) => {
  if (!row) return null;
  return {
    Id: row.project_id,
    _id: row.id,
    pImg: row.p_img,
    title: row.title,
    slug: row.slug,
    sub: row.sub,
    description: row.description,
    Industry: row.industry,
    Country: row.country,
    Technologies1: row.technologies1,
    Technologies2: row.technologies2,
    thumb1: row.thumb1,
    thumb2: row.thumb2,
    category: row.category,
    status: row.status,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Project = {
  async findAll({ page = 1, limit = 10, category, status, featured, search } = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category ILIKE $${paramIndex++}`);
      params.push(`%${category}%`);
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (featured !== undefined) {
      conditions.push(`featured = $${paramIndex++}`);
      params.push(featured === 'true' || featured === true);
    }
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR sub ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    const countParams = params.slice(0, params.length - 2);
    const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;

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
      `SELECT * FROM projects WHERE project_id = $1 OR slug = $1`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  async create(data) {
    const res = await query(
      `INSERT INTO projects (project_id, p_img, title, slug, sub, description, industry, country, technologies1, technologies2, thumb1, thumb2, category, status, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        data.Id, data.pImg, data.title, data.slug, data.sub || '',
        data.description, data.Industry || '', data.Country || '',
        data.Technologies1 || '', data.Technologies2 || '',
        data.thumb1 || '', data.thumb2 || '', data.category || 'general',
        data.status || 'active', data.featured || false,
      ]
    );
    return mapRow(res.rows[0]);
  },

  async updateByIdOrSlug(identifier, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    const fieldMap = {
      pImg: 'p_img', title: 'title', slug: 'slug', sub: 'sub',
      description: 'description', Industry: 'industry', Country: 'country',
      Technologies1: 'technologies1', Technologies2: 'technologies2',
      thumb1: 'thumb1', thumb2: 'thumb2', category: 'category',
      status: 'status', featured: 'featured',
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
      `UPDATE projects SET ${fields.join(', ')} WHERE project_id = $${paramIndex} OR slug = $${paramIndex} RETURNING *`,
      params
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  async deleteByIdOrSlug(identifier) {
    const res = await query(
      `DELETE FROM projects WHERE project_id = $1 OR slug = $1 RETURNING *`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  async findByCategory(category) {
    const res = await query(
      `SELECT * FROM projects WHERE category ILIKE $1 ORDER BY created_at DESC`,
      [`%${category}%`]
    );
    return res.rows.map(mapRow);
  },

  async findFeatured() {
    const res = await query(
      `SELECT * FROM projects WHERE featured = true ORDER BY created_at DESC`
    );
    return res.rows.map(mapRow);
  },

  async findByStatus(status) {
    const res = await query(
      `SELECT * FROM projects WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
    return res.rows.map(mapRow);
  },
};

module.exports = Project;
