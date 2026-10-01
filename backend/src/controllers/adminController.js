const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[stores]] = await pool.query('SELECT COUNT(*) as count FROM stores');
    const [[ratings]] = await pool.query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: users.count,
      totalStores: stores.count,
      totalRatings: ratings.count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

async function addUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    if (!['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({ error: 'Name must be between 20 and 60 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email required.' });
    }

    if (!address || address.trim().length > 400) {
      return res.status(400).json({ error: 'Address max 400 characters.' });
    }

    if (!password || password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-\+\=]/.test(password)) {
      return res.status(400).json({ error: 'Password does not meet validation rules.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), address: address.trim(), role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
}

async function addStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({ error: 'Store name must be 20 to 60 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Valid store email required.' });
    }

    if (!address || address.trim().length > 400) {
      return res.status(400).json({ error: 'Store address max 400 characters.' });
    }

    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Store email already registered.' });
    }

    const parsedOwnerId = ownerId ? parseInt(ownerId, 10) : null;

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), parsedOwnerId]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), address: address.trim(), ownerId: parsedOwnerId }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create store' });
  }
}

async function getUsers(req, res) {
  try {
    const { search, role, sortBy = 'id', order = 'ASC' } = req.query;

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.address, u.role, u.created_at,
        s.id as store_id, s.name as store_name,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
    `;

    const whereClauses = [];
    const params = [];

    if (role) {
      whereClauses.push('u.role = ?');
      params.push(role);
    }
    if (search) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY u.id, s.id';

    const validSort = ['id', 'name', 'email', 'address', 'role', 'rating'].includes(sortBy) ? sortBy : 'id';
    const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${validSort === 'rating' ? 'rating' : 'u.' + validSort} ${validOrder}`;

    const [users] = await pool.query(sql, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, s.name as store_name, COALESCE(ROUND(AVG(r.rating), 1), 0) as rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = ? GROUP BY u.id, s.id`,
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function getStores(req, res) {
  try {
    const { search, sortBy = 'id', order = 'ASC' } = req.query;

    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.owner_id,
        u.name as owner_name,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
    `;

    const params = [];
    if (search) {
      sql += ' WHERE (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY s.id, u.id';

    const validSort = ['id', 'name', 'email', 'address', 'rating'].includes(sortBy) ? sortBy : 'id';
    const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${validSort === 'rating' ? 'rating' : 's.' + validSort} ${validOrder}`;

    const [stores] = await pool.query(sql, params);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
}

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getUserById,
  getStores
};
