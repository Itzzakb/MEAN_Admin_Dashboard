const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/stats', authorize('admin'), getStats);

module.exports = router;
