const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getUserById,
  getStores
} = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken, checkRole('ADMIN'));

router.get('/stats', getDashboardStats);
router.post('/users', addUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/stores', addStore);
router.get('/stores', getStores);

module.exports = router;
