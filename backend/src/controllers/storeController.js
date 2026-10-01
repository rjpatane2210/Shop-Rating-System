const pool = require('../config/db');

async function getAllStores(req, res) {
  try {
    const { search, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user ? req.user.id : null;

    let sql = '';
    const params = [];

    if (userId) {
      sql = `
        SELECT 
          s.id, s.name, s.address, s.email,
          COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
          COUNT(r.id) as total_ratings,
          ur.rating as user_rating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
      `;
      params.push(userId);
    } else {
      sql = `
        SELECT 
          s.id, s.name, s.address, s.email,
          COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
          COUNT(r.id) as total_ratings,
          NULL as user_rating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
      `;
    }

    if (search) {
      sql += ' WHERE (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY s.id';
    if (userId) sql += ', ur.rating';

    const validSort = ['name', 'address', 'rating', 'user_rating'].includes(sortBy) ? sortBy : 'name';
    const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${validSort === 'rating' ? 'rating' : validSort === 'user_rating' ? 'user_rating' : 's.' + validSort} ${validOrder}`;

    const [stores] = await pool.query(sql, params);
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
}

module.exports = {
  getAllStores
};
