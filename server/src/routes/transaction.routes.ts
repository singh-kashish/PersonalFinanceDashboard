import express from 'express';

import authMiddleware from '../middlewares/auth.middleware';

import {
  postTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';
import {
  createTransactionSchema,
  getTransactionsSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from '../validators/transaction.validator';

import validate from '../middlewares/validate.middleware';
const router = express.Router();

router.use(authMiddleware);

router.post(
  '/transactions',
  validate(createTransactionSchema,'body'),
  postTransaction
);

router.get(
  '/transactions',
  validate(getTransactionsSchema,'query'),
  getTransactions
);

router.get(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  getTransaction
);

// Chain middlewares
router.patch(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  validate(updateTransactionSchema,'body'),
  updateTransaction
);

router.delete(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  deleteTransaction
);

export default router;