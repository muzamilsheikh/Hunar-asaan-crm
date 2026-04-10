const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportsController');

// GET /api/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&type=monthly|yearly|custom
router.get('/', generateReport);

module.exports = router;
