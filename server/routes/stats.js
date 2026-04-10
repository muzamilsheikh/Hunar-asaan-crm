const express = require('express');
const router = express.Router();
const { getFinancialDashboardStats } = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stats/financial-dashboard - Professional Financial Dashboard Statistics
router.get('/financial-dashboard', authenticateToken, getFinancialDashboardStats);

module.exports = router;