import express from 'express';

import authMiddleware from '../middlewares/auth.middleware';

import {
  postTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/transactions',
  postTransaction
);

router.get(
  '/transactions',
  getTransactions
);

router.get(
  '/transactions/:id',
  getTransaction
);

router.patch(
  '/transactions/:id',
  updateTransaction
);

router.delete(
  '/transactions/:id',
  deleteTransaction
);

export default router;