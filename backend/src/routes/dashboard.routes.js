const express = require('express');
const router = express.Router();

const { getMetrics } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

// GET /api/dashboard/metrics – protected
router.get('/metrics', protect, getMetrics);

module.exports = router;
