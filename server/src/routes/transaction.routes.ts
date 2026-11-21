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
 * components:
 *   schemas:
 *     TransactionInput:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - category
 *       properties:
 *         amount:
 *           type: string
 *           format: decimal
 *           pattern: '^\\d+(\\.\\d{1,2})?$'
 *           description: Amount as a decimal string with max 2 decimal places (e.g., "450.75")
 *           example: "450.75"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         category:
 *           type: string
 *           minLength: 1
 *         description:
 *           type: string
 *           maxLength: 300
 *         date:
 *           type: string
 *           format: date-time
 *     TransactionUpdateInput:
 *       type: object
 *       properties:
 *         amount:
 *           type: string
 *           format: decimal
 *           pattern: '^\\d+(\\.\\d{1,2})?$'
 *           description: Amount as a decimal string with max 2 decimal places (e.g., "450.75")
 *           example: "450.75"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         category:
 *           type: string
 *           minLength: 1
 *         description:
 *           type: string
 *           maxLength: 300
 *         date:
 *           type: string
 *           format: date-time
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         amount:
 *           type: string
 *           format: decimal
 *           description: Amount as a decimal string with exactly 2 decimal places
 *           example: "450.75"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         category:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         date:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInput'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TransactionResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionUpdateInput'
 *     responses:
 *       200:
 *         description: Transaction updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */

router.delete(
  '/transactions/:id',
  validate(transactionIdSchema,'params'),
  deleteTransaction
);

export default router;