const express = require('express');
const router = express.Router();
const { getAllStores } = require('../controllers/storeController');
const { submitOrUpdateRating } = require('../controllers/ratingController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/stores', verifyToken, getAllStores);
router.post('/ratings', verifyToken, checkRole('NORMAL_USER'), submitOrUpdateRating);

module.exports = router;
