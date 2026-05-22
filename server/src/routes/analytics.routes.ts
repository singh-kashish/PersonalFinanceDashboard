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

export default router;