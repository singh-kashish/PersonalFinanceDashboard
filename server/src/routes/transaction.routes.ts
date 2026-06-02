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

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction APIs
 */


/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create transaction
 *     tags: [Transactions]
 */

router.post(
  '/transactions',
  validate(createTransactionSchema,'body'),
  postTransaction
);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 */

router.get(
  '/transactions',
  validate(getTransactionsSchema,'query'),
  getTransactions
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get single transaction
 *     tags: [Transactions]
 */

router.get(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  getTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Update transaction
 *     tags: [Transactions]
 */

// Chain middlewares
router.patch(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  validate(updateTransactionSchema,'body'),
  updateTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transactions]
 */

router.delete(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  deleteTransaction
);

export default router;