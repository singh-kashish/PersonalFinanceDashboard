import express from 'express';

import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import {
  summaryController,
  categoryController,
  monthlyController,
  categoryTrendsController,
} from '../controllers/analytics.controller';
import { analyticsQuerySchema, categoryTrendsQuerySchema } from "../validators/analytics.validator"

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics APIs
 */

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Analytics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: string
 *                       pattern: '^\d+\.\d{2}$'
 *                       example: "1250.75"
 *                     totalExpense:
 *                       type: string
 *                       pattern: '^\d+\.\d{2}$'
 *                       example: "800.50"
 *                     balance:
 *                       type: string
 *                       pattern: '^-?\d+\.\d{2}$'
 *                       example: "450.25"
 *                     recentTransactions:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/categories:
 *   get:
 *     summary: Get category-wise analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Category analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           totalAmount:
 *                             type: string
 *                             pattern: '^\d+\.\d{2}$'
 *                             example: "300.00"
 *                           transactionCount:
 *                             type: integer
 *                           percentage:
 *                             type: string
 *                             pattern: '^\d+\.\d{2}$'
 *                             example: "33.33"
 *                     recentTransactions:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/monthly:
 *   get:
 *     summary: Get monthly analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Monthly analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     monthly:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             pattern: '^\d{4}-\d{2}$'
 *                             example: "2024-01"
 *                           income:
 *                             type: string
 *                             pattern: '^\d+\.\d{2}$'
 *                             example: "1250.75"
 *                           expense:
 *                             type: string
 *                             pattern: '^\d+\.\d{2}$'
 *                             example: "800.50"
 *                           balance:
 *                             type: string
 *                             pattern: '^-?\d+\.\d{2}$'
 *                             example: "450.25"
 *                     recentTransactions:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/category-trends:
 *   get:
 *     summary: Get category trends over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category trends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         pattern: '^\d{4}-\d{2}$'
 *                         example: "2024-01"
 *                       category:
 *                         type: string
 *                       amount:
 *                         type: string
 *                         pattern: '^\d+\.\d{2}$'
 *                         example: "300.00"
 *       401:
 *         description: Unauthorized
 */

router.get(
  '/analytics/summary',
  validate(analyticsQuerySchema,'query'),
  summaryController
);

router.get(
  '/analytics/categories',
  validate(analyticsQuerySchema,'query'),
  categoryController
);

router.get(
  '/analytics/monthly',
  validate(analyticsQuerySchema,'query'),
  monthlyController
);

router.get(
  '/analytics/category-trends',
  validate(categoryTrendsQuerySchema,'query'),
  categoryTrendsController
);

export default router;
