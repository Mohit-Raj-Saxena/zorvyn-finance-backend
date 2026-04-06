const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends
} = require('../controllers/dashboardController');

// GET /api/dashboard/summary - total income, expenses, net balance (viewer, analyst, admin)
router.get('/summary', auth, roles('viewer', 'analyst', 'admin'), getSummary);

// GET /api/dashboard/categories - category wise totals (analyst, admin)
router.get('/categories', auth, roles('analyst', 'admin'), getCategoryTotals);

// GET /api/dashboard/recent - recent activity (viewer, analyst, admin)
router.get('/recent', auth, roles('viewer', 'analyst', 'admin'), getRecentActivity);

// GET /api/dashboard/trends/monthly - monthly trends (analyst, admin)
router.get('/trends/monthly', auth, roles('analyst', 'admin'), getMonthlyTrends);

// GET /api/dashboard/trends/weekly - weekly trends (analyst, admin)
router.get('/trends/weekly', auth, roles('analyst', 'admin'), getWeeklyTrends);

module.exports = router;