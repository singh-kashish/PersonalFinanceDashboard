import prisma from '../infra/prisma';

import AppError from '../utils/AppError';
import { Prisma } from '../generated/prisma';

import {
  CreateTransactionInput,
  GetTransactionsInput,
  UpdateTransactionInput,
} from '../validators/transaction.validator';
import { paginate } from '../utils/pagination';
import { buildTransactionWhere } from '../utils/buildTransactionWhere';
import { buildTransactionOrder } from '../utils/buildTransactionOrder';
import { invalidateAnalyticsForUser } from '../utils/redis/analyticsCache';

const createTransactionService = async (
  transactionData: CreateTransactionInput,
  userId: number
) => {
  const result = prisma.transaction.create({
    data: {
      amount: transactionData.amount,

      type: transactionData.type,

      category: transactionData.category.toUpperCase(),

      description:
        transactionData.description ?? null,

      userId,

      date: transactionData.date
        ? new Date(transactionData.date)
        : new Date(),
    },
  });
  // Prisma did not throw => success
  invalidateAnalyticsForUser(userId).catch((err) =>
    console.error('Failed to invalidate analytics cache on create', { userId }, err)
  );

  return result;
};

const getTransactionService = async (
  transactionId: number,
  userId: number
) => {
  const transaction =
    await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

  if (!transaction) {
    throw new AppError(
      'Transaction not found.',
      404
    );
  }

  return transaction;
};

export const getTransactionsService = async (
  parameters:GetTransactionsInput,
  userId:number
) => {

  const {
    page,
    limit,
    sortBy,
    order,
  } = parameters;

  const where =
    buildTransactionWhere(
      parameters,
      userId
    );

  const orderBy =
    buildTransactionOrder({
      sortBy,
      order,
    });

  const {skip,take} =
    paginate(page,limit);

  const [transactions,total] =
    await Promise.all([

      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take,
      }),

      prisma.transaction.count({
        where,
      }),
    ]);

  return {
    transactions,

    pagination:{
      total,
      page,
      limit,
      pages:Math.ceil(
        total/limit
      ),
    },
  };
};


const updateTransactionService = async (transactionId: number,userId: number,updateData: UpdateTransactionInput) => {
  const result = await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      userId,
    },
    data: {
      ...(updateData.amount !== undefined && { amount: updateData.amount }),
      ...(updateData.type !== undefined && { type: updateData.type }),
      ...(updateData.category !== undefined && {
        category: updateData.category.toUpperCase(),
      }),
      ...(updateData.description !== undefined && {
        description: updateData.description,
      }),
      ...(updateData.date !== undefined && {
        date: new Date(updateData.date),
      }),
    },
  });

  if (result.count === 0) {
    throw new AppError('Transaction not found', 404);
  }

  invalidateAnalyticsForUser(userId).catch((err) =>
    console.error('Failed to invalidate analytics cache on update', { userId }, err)
  );

  // If you need the updated row, you can fetch it in a second query
};


const deleteTransactionService = async (
  transactionId: number,
  userId: number
) => {
  const result = await prisma.transaction.deleteMany({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new AppError('Transaction not found', 404);
  }

  invalidateAnalyticsForUser(userId).catch((err) =>
    console.error('Failed to invalidate analytics cache on delete', { userId }, err)
  );

  return true;
};


export {
  createTransactionService,
  getTransactionService,
  updateTransactionService,
  deleteTransactionService,
};