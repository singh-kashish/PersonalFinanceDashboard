import {
  Request,
  Response,
  NextFunction,
} from 'express';

import {CreateTransactionInput, GetTransactionsInput,UpdateTransactionInput,TransactionType,TransactionIdType} from '../validators/transaction.validator'

import {
  createTransactionService,
  getTransactionService,
  getTransactionsService,
  updateTransactionService,
  deleteTransactionService,
} from '../services/transaction.service';

import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';

const postTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transaction =
      await createTransactionService(
        req.validated?.body as CreateTransactionInput,
        req.auth.userId
      );
    sendSuccess(res,201,transaction,'Transaction added')
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

    const transaction =
      await getTransactionService(
        req.validated?.params as TransactionIdType,
        req.auth.userId
      );
    sendSuccess(res,200,transaction)
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
    const transactions =
      await getTransactionsService(
        req.validated?.query as GetTransactionsInput,
        req.auth.userId
      );
    sendSuccess(res,200,transactions);
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
    const updatedTransaction =
      await updateTransactionService(
        req.validated?.params as TransactionIdType,
        req.auth.userId,
        req.validated?.body as UpdateTransactionInput
      );

    sendSuccess(res,200,updateTransaction)
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
    await deleteTransactionService(
      req.validated?.params as TransactionIdType,
      req.auth.userId
    );
    sendSuccess(res,200,'Deleted','Deleted');
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