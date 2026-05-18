import prisma from '../lib/prisma';

import AppError from '../utils/AppError';

import {
  CreateTransactionInput,
  GetTransactionsInput,
  UpdateTransactionInput,
} from '../validators/transaction.validator';

const createTransactionService = async (
  transactionData: CreateTransactionInput,
  userId: number
) => {
  return prisma.transaction.create({
    data: {
      amount: transactionData.amount,

      type: transactionData.type,

      category: transactionData.category,

      description:
        transactionData.description ?? null,

      userId,

      date: transactionData.date
        ? new Date(transactionData.date)
        : new Date(),
    },
  });
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

const getTransactionsService = async (
  parameters: GetTransactionsInput,
  userId: number
) => {
  const {
    page,
    limit,
    category,
    sortBy,
    order,
    type,
  } = parameters;

  const where: {
    userId: number;
    category?: string;
    type?: 'INCOME' | 'EXPENSE';
  } = {
    userId,
  };

  if (category) {
    where.category = category;
  }

  if (type) {
    where.type = type;
  }

  const skip = (page - 1) * limit;

  const [transactions, total] =
    await Promise.all([
      prisma.transaction.findMany({
        where,

        orderBy: {
          [sortBy]: order,
        },

        skip,

        take: limit,
      }),

      prisma.transaction.count({
        where,
      }),
    ]);

  return {
    transactions,

    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const updateTransactionService = async (
  transactionId: number,
  userId: number,
  updateData: UpdateTransactionInput
) => {
  const existingTransaction =
    await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

  if (!existingTransaction) {
    throw new AppError(
      'Transaction not found.',
      404
    );
  }

  return prisma.transaction.update({
    where: {
      id: transactionId,
    },

    data: {
      ...(updateData.amount !== undefined && {
        amount: updateData.amount,
      }),

      ...(updateData.type !== undefined && {
        type: updateData.type,
      }),

      ...(updateData.category !== undefined && {
        category: updateData.category,
      }),

      ...(updateData.description !== undefined && {
        description:
          updateData.description,
      }),

      ...(updateData.date !== undefined && {
        date: new Date(updateData.date),
      }),
    },
  });
};

const deleteTransactionService = async (
  transactionId: number,
  userId: number
) => {
  const existingTransaction =
    await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

  if (!existingTransaction) {
    throw new AppError(
      'Transaction not found.',
      404
    );
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return true;
};

export {
  createTransactionService,
  getTransactionService,
  getTransactionsService,
  updateTransactionService,
  deleteTransactionService,
};