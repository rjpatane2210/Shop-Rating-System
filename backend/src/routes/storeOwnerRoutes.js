const express = require('express');
const router = express.Router();
const { getStoreOwnerDashboard } = require('../controllers/storeOwnerController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken, checkRole('STORE_OWNER'));

router.get('/dashboard', getStoreOwnerDashboard);

module.exports = router;
