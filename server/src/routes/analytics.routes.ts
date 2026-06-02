import express from 'express';

import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import {
  summaryController,
  categoryController,
  monthlyController,
} from '../controllers/analytics.controller';
import { analyticsQuerySchema } from "../validators/analytics.validator"

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
 */
router.get(
  '/analytics/summary',
  validate(analyticsQuerySchema,'query'),
  summaryController
);

/**
 * @swagger
 * /analytics/categories:
 *   get:
 *     summary: Get Category wise analytics 
 *     tags: [Analytics]
 */
router.get(
  '/analytics/categories',
  validate(analyticsQuerySchema,'query'),
  categoryController
);

/**
 * @swagger
 * /analytics/monthly:
 *   get:
 *     summary: Get monthly analytics
 *     tags: [Analytics]
 */
router.get(
  '/analytics/monthly',
  validate(analyticsQuerySchema,'query'),
  monthlyController
);

export default router;