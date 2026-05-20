import express from 'express';

import authMiddleware from '../middlewares/auth.middleware';

import {
  summaryController,
  categoryController,
  monthlyController,
} from '../controllers/analytics.controller';

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/analytics/summary',
  summaryController
);

router.get(
  '/analytics/categories',
  categoryController
);

router.get(
  '/analytics/monthly',
  monthlyController
);

export default router;