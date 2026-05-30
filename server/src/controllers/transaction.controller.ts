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
import { asyncHandler } from '../utils/asyncHandler';

const postTransaction = asyncHandler(async (
  req,res)=> {
    const transaction =
      await createTransactionService(
        req.validated?.body as CreateTransactionInput,
        req.auth.userId
      );
    sendSuccess(res,201,transaction,'Transaction added')
});

const getTransaction = asyncHandler(async(req,res)=>{
  const {id} = req.validated?.params as TransactionIdType;
    const transaction =
      await getTransactionService(
        id ,
        req.auth.userId
      );
    sendSuccess(res,200,transaction)
});

const getTransactions =
asyncHandler(async(req,res)=>{

    const result =
      await getTransactionsService(
        req.validated?.query as GetTransactionsInput,
        req.auth.userId
      );

    sendSuccess(
      res,
      200,
      result
    );

});

const updateTransaction = asyncHandler(
  async(req,
  res) => {
      const {id} = req.validated?.params as TransactionIdType
      const updatedTransaction =
      await updateTransactionService(
        id,
        req.auth.userId,
        req.validated?.body as UpdateTransactionInput
      );
    sendSuccess(res,200,updateTransaction)
});

const deleteTransaction = asyncHandler(async (
  req,res
)=> {
    const {id} =  req.validated?.params as TransactionIdType;
    await deleteTransactionService(
       id,
      req.auth.userId
    );
    sendSuccess(res,200,'Deleted','Deleted');
});

export {
  postTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};