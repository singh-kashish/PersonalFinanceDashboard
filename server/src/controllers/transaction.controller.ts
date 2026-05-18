import {
  Request,
  Response,
  NextFunction,
} from 'express';

import {
  createTransactionSchema,
  getTransactionsSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from '../validators/transaction.validator';

import {
  createTransactionService,
  getTransactionService,
  getTransactionsService,
  updateTransactionService,
  deleteTransactionService,
} from '../services/transaction.service';

import AppError from '../utils/AppError';

const postTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedBody =
      createTransactionSchema.safeParse(
        req.body
      );

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ??
          'Invalid request body',
        400
      );
    }

    const transaction =
      await createTransactionService(
        parsedBody.data,
        req.auth.userId
      );

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedId =
      transactionIdSchema.safeParse(
        req.params.id
      );

    if (!parsedId.success) {
      throw new AppError(
        parsedId.error.issues[0]?.message ??
          'Invalid transaction id',
        400
      );
    }

    const transaction =
      await getTransactionService(
        parsedId.data,
        req.auth.userId
      );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedQuery =
      getTransactionsSchema.safeParse(
        req.query
      );

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ??
          'Invalid query params',
        400
      );
    }

    const transactions =
      await getTransactionsService(
        parsedQuery.data,
        req.auth.userId
      );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedId =
      transactionIdSchema.safeParse(
        req.params.id
      );

    if (!parsedId.success) {
      throw new AppError(
        parsedId.error.issues[0]?.message ??
          'Invalid transaction id',
        400
      );
    }

    const parsedBody =
      updateTransactionSchema.safeParse(
        req.body
      );

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ??
          'Invalid update data',
        400
      );
    }

    const updatedTransaction =
      await updateTransactionService(
        parsedId.data,
        req.auth.userId,
        parsedBody.data
      );

    res.status(200).json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedId =
      transactionIdSchema.safeParse(
        req.params.id
      );

    if (!parsedId.success) {
      throw new AppError(
        parsedId.error.issues[0]?.message ??
          'Invalid transaction id',
        400
      );
    }

    await deleteTransactionService(
      parsedId.data,
      req.auth.userId
    );

    res.status(200).json({
      success: true,
      message:
        'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {
  postTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};