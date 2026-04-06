import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '../../types';

const router = Router();

// leaving these swagger definitions alone
/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary (totalIncome, totalExpenses, netBalance, totalTransactions)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 */
router.get(
  '/summary',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST, Role.VIEWER),
  DashboardController.getSummary
);

/**
 * @swagger
 * /api/dashboard/category-breakdown:
 *   get:
 *     summary: Get per-category totals
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown fetched successfully
 */
router.get(
  '/category-breakdown',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST), // viewers shouldn't see these breakdowns
  DashboardController.getCategoryBreakdown
);

/**
 * @swagger
 * /api/dashboard/monthly-trends:
 *   get:
 *     summary: Get monthly income vs expense trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends fetched successfully
 */
router.get(
  '/monthly-trends',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST),
  DashboardController.getMonthlyTrends
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get last 10 transactions sorted by date
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity fetched successfully
 */
router.get(
  '/recent-activity',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST, Role.VIEWER), 
  DashboardController.getRecentActivity
);

/**
 * @swagger
 * /api/dashboard/weekly-summary:
 *   get:
 *     summary: Get income and expense for the last 7 days
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly summary fetched successfully
 */
router.get(
  '/weekly-summary',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST),
  DashboardController.getWeeklySummary
);

export default router;
