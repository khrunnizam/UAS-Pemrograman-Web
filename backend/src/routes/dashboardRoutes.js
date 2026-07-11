const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// GET /api/dashboard/stats — Statistik dashboard (protected)
router.get('/stats', authMiddleware, getDashboardStats);

module.exports = router;
