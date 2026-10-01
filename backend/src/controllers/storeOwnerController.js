const pool = require('../config/db');

async function getStoreOwnerDashboard(req, res) {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.json({
        hasStore: false,
        message: 'No store assigned to your account.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratingsList: []
      });
    }

    const store = stores[0];

    const [[stats]] = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating), 1), 0) as averageRating, COUNT(id) as totalRatings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const { sortBy = 'updated_at', order = 'DESC' } = req.query;
    const validSort = ['user_name', 'user_email', 'rating', 'updated_at'].includes(sortBy) ? sortBy : 'updated_at';
    const validOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let sortCol = 'r.updated_at';
    if (validSort === 'user_name') sortCol = 'u.name';
    else if (validSort === 'user_email') sortCol = 'u.email';
    else if (validSort === 'rating') sortCol = 'r.rating';

    const [ratingsList] = await pool.query(
      `
      SELECT 
        r.id as rating_id, r.rating, r.created_at, r.updated_at,
        u.id as user_id, u.name as user_name, u.email as user_email, u.address as user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY ${sortCol} ${validOrder}
      `,
      [store.id]
    );

    res.json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      },
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      ratingsList
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load owner dashboard' });
  }
}

module.exports = {
  getStoreOwnerDashboard
};
