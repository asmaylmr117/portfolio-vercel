const { query } = require('../db');

// Map DB row to the same JSON shape the frontend expects (camelCase matching old Mongoose fields)
const mapRow = (row) => {
  if (!row) return null;
  return {
    id: row.blog_id,
    _id: row.id,
    title: row.title,
    slug: row.slug,
    screens: row.screens,
    bSingle: row.b_single,
    description: row.description,
    author: row.author,
    authorTitle: row.author_title,
    create_at: row.create_at,
    comment: row.comment,
    thumb: row.thumb,
    blClass: row.bl_class,
    views: row.views,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Blog = {
  // Find all blogs with filters, pagination, sorting
  async findAll({ page = 1, limit = 10, author, thumb, search, isPublished = true } = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (isPublished !== undefined) {
      conditions.push(`is_published = $${paramIndex++}`);
      params.push(isPublished);
    }
    if (author) {
      conditions.push(`author ILIKE $${paramIndex++}`);
      params.push(`%${author}%`);
    }
    if (thumb) {
      conditions.push(`thumb ILIKE $${paramIndex++}`);
      params.push(`%${thumb}%`);
    }
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM blogs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    const countQuery = `SELECT COUNT(*) FROM blogs ${whereClause}`;
    const countParams = params.slice(0, params.length - 2);

    const [dataRes, countRes] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, countParams),
    ]);

    return {
      rows: dataRes.rows.map(mapRow),
      total: parseInt(countRes.rows[0].count),
    };
  },

  // Find by blog_id or slug
  async findByIdOrSlug(identifier) {
    const res = await query(
      `SELECT * FROM blogs WHERE blog_id = $1 OR slug = $1`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  // Create a new blog
  async create(data) {
    const res = await query(
      `INSERT INTO blogs (blog_id, title, slug, screens, b_single, description, author, author_title, create_at, comment, thumb, bl_class, views, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        data.id, data.title, data.slug, data.screens, data.bSingle,
        data.description, data.author, data.authorTitle, data.create_at,
        data.comment || '0', data.thumb, data.blClass || 'format-standard-image',
        data.views || 0, data.isPublished !== undefined ? data.isPublished : true,
      ]
    );
    return mapRow(res.rows[0]);
  },

  // Update a blog
  async updateByIdOrSlug(identifier, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    const fieldMap = {
      title: 'title', slug: 'slug', screens: 'screens', bSingle: 'b_single',
      description: 'description', author: 'author', authorTitle: 'author_title',
      create_at: 'create_at', comment: 'comment', thumb: 'thumb',
      blClass: 'bl_class', views: 'views', isPublished: 'is_published',
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
      `UPDATE blogs SET ${fields.join(', ')} WHERE blog_id = $${paramIndex} OR slug = $${paramIndex} RETURNING *`,
      params
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  // Delete a blog
  async deleteByIdOrSlug(identifier) {
    const res = await query(
      `DELETE FROM blogs WHERE blog_id = $1 OR slug = $1 RETURNING *`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },

  // Find by thumb category
  async findByThumb(thumb) {
    const res = await query(
      `SELECT * FROM blogs WHERE thumb ILIKE $1 AND is_published = true ORDER BY created_at DESC`,
      [`%${thumb}%`]
    );
    return res.rows.map(mapRow);
  },

  // Find recent blogs
  async findRecent(count = 5) {
    const res = await query(
      `SELECT * FROM blogs WHERE is_published = true ORDER BY created_at DESC LIMIT $1`,
      [parseInt(count)]
    );
    return res.rows.map(mapRow);
  },

  // Increment views
  async incrementViews(identifier) {
    const res = await query(
      `UPDATE blogs SET views = views + 1, updated_at = NOW() WHERE blog_id = $1 OR slug = $1 RETURNING *`,
      [identifier]
    );
    return res.rows.length > 0 ? mapRow(res.rows[0]) : null;
  },
};

module.exports = Blog;
