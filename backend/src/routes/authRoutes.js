const express = require('express');
const router = express.Router();
const { signup, login, updatePassword, me } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/update-password', verifyToken, updatePassword);
router.get('/me', verifyToken, me);

module.exports = router;
