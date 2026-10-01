const pool = require('../config/db');

async function submitOrUpdateRating(req, res) {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    const numRating = Number(rating);
    if (!storeId || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const [existing] = await pool.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);

    let message = '';
    if (existing.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
        [numRating, userId, storeId]
      );
      message = 'Rating updated successfully';
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, numRating]
      );
      message = 'Rating submitted successfully';
    }

    const [[avgResult]] = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating), 1), 0) as avgRating, COUNT(id) as totalRatings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    res.json({
      message,
      userRating: numRating,
      overallRating: avgResult.avgRating,
      totalRatings: avgResult.totalRatings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
}

module.exports = {
  submitOrUpdateRating
};
