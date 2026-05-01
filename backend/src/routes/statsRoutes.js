const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/statsController');
const { requireRole } = require('../middlewares/auth');

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve statistics for the admin dashboard including revenue, orders, customers, and top dishes.
 *     tags: [Stats]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [today, week, month, all]
 *           default: month
 *         description: Time range to filter the statistics
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires admin or employee role)
 *       500:
 *         description: Server error
 */
router.get(
  '/dashboard',
  requireRole('admin', 'employee', 'system_admin'),
  StatsController.getDashboardStats
);

module.exports = router;
