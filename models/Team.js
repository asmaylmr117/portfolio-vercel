const { query } = require('../db');

const mapRow = (row) => {
  if (!row) return null;
  return {
    Id: row.team_id,
    _id: row.id,
    tImg: row.t_img,
    name: row.name,
    slug: row.slug,
    title: row.title,
    email: row.email,
    phone: row.phone,
    bio: row.bio,
    socialLinks: {
      linkedin: row.social_linkedin || '',
      twitter: row.social_twitter || '',
      github: row.social_github || '',
      website: row.social_website || '',
    },
    skills: row.skills || [],
    experience: row.experience,
    isActive: row.is_active,
    joinDate: row.join_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Team = {
  async findAll({ page = 1, limit = 10, active, title, search } = {}) {
    const conditions = [];
    const params = [];
    let pi = 1;
    if (active !== undefined) { conditions.push(`is_active = $${pi++}`); params.push(active === 'true' || active === true); }
    if (title) { conditions.push(`title ILIKE $${pi++}`); params.push(`%${title}%`); }
    if (search) { conditions.push(`(name ILIKE $${pi} OR title ILIKE $${pi} OR bio ILIKE $${pi})`); params.push(`%${search}%`); pi++; }
    const wh = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const dq = `SELECT * FROM teams ${wh} ORDER BY join_date DESC LIMIT $${pi++} OFFSET $${pi++}`;
    params.push(parseInt(limit), parseInt(offset));
    const cp = params.slice(0, params.length - 2);
    const [dr, cr] = await Promise.all([query(dq, params), query(`SELECT COUNT(*) FROM teams ${wh}`, cp)]);
    return { rows: dr.rows.map(mapRow), total: parseInt(cr.rows[0].count) };
  },
  async findByIdOrSlug(id) {
    const r = await query(`SELECT * FROM teams WHERE team_id = $1 OR slug = $1`, [id]);
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },
  async create(data) {
    const sl = data.socialLinks || {};
    const r = await query(
      `INSERT INTO teams (team_id,t_img,name,slug,title,email,phone,bio,social_linkedin,social_twitter,social_github,social_website,skills,experience,is_active,join_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [data.Id, data.tImg, data.name, data.slug, data.title, data.email||'', data.phone||'', data.bio||'', sl.linkedin||'', sl.twitter||'', sl.github||'', sl.website||'', data.skills||[], data.experience||0, data.isActive!==undefined?data.isActive:true, data.joinDate||new Date()]
    );
    return mapRow(r.rows[0]);
  },
  async updateByIdOrSlug(identifier, data) {
    const f = []; const p = []; let pi = 1;
    const fm = { tImg:'t_img', name:'name', slug:'slug', title:'title', email:'email', phone:'phone', bio:'bio', skills:'skills', experience:'experience', isActive:'is_active', joinDate:'join_date' };
    for (const [k, c] of Object.entries(fm)) { if (data[k] !== undefined) { f.push(`${c} = $${pi++}`); p.push(data[k]); } }
    if (data.socialLinks) {
      if (data.socialLinks.linkedin !== undefined) { f.push(`social_linkedin = $${pi++}`); p.push(data.socialLinks.linkedin); }
      if (data.socialLinks.twitter !== undefined) { f.push(`social_twitter = $${pi++}`); p.push(data.socialLinks.twitter); }
      if (data.socialLinks.github !== undefined) { f.push(`social_github = $${pi++}`); p.push(data.socialLinks.github); }
      if (data.socialLinks.website !== undefined) { f.push(`social_website = $${pi++}`); p.push(data.socialLinks.website); }
    }
    if (f.length === 0) return this.findByIdOrSlug(identifier);
    f.push(`updated_at = NOW()`); p.push(identifier);
    const r = await query(`UPDATE teams SET ${f.join(', ')} WHERE team_id = $${pi} OR slug = $${pi} RETURNING *`, p);
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },
  async deleteByIdOrSlug(id) {
    const r = await query(`DELETE FROM teams WHERE team_id = $1 OR slug = $1 RETURNING *`, [id]);
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },
  async findByTitle(title) {
    const r = await query(`SELECT * FROM teams WHERE title ILIKE $1 AND is_active = true ORDER BY join_date DESC`, [`%${title}%`]);
    return r.rows.map(mapRow);
  },
  async findActive() {
    const r = await query(`SELECT * FROM teams WHERE is_active = true ORDER BY join_date DESC`);
    return r.rows.map(mapRow);
  },
  async toggleStatus(id) {
    const r = await query(`UPDATE teams SET is_active = NOT is_active, updated_at = NOW() WHERE team_id = $1 OR slug = $1 RETURNING *`, [id]);
    return r.rows.length > 0 ? mapRow(r.rows[0]) : null;
  },
  async getStats() {
    const [t, a, i, ps] = await Promise.all([
      query(`SELECT COUNT(*) FROM teams`),
      query(`SELECT COUNT(*) FROM teams WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM teams WHERE is_active = false`),
      query(`SELECT title AS _id, COUNT(*)::int AS count FROM teams WHERE is_active = true GROUP BY title ORDER BY count DESC`),
    ]);
    return { totalMembers: parseInt(t.rows[0].count), activeMembers: parseInt(a.rows[0].count), inactiveMembers: parseInt(i.rows[0].count), positionStats: ps.rows };
  },
};

module.exports = Team;
