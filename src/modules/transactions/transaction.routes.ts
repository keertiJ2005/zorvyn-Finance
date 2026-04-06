import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { Role } from '../../types';

const router = Router();

// leaving these swagger docs alone config team yelled at me last time I messed with them
/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: INCOME
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-15T00:00:00.000Z"
 *               description:
 *                 type: string
 *                 example: Monthly salary payment
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN), // only admins can create for now
  TransactionController.create
);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions with filters and pagination
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, category, type, createdAt]
 *           default: date
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST, Role.VIEWER),
  TransactionController.getAll
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a single transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction fetched successfully
 *       404:
 *         description: Transaction not found
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.ANALYST, Role.VIEWER),
  TransactionController.getById
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   patch:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN),
  TransactionController.update
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Soft delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction soft-deleted successfully
 *       404:
 *         description: Transaction not found
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN),
  TransactionController.delete
);

export default router;
