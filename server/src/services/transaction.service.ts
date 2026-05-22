import prisma from '../lib/prisma';

import AppError from '../utils/AppError';
import { Prisma } from '../generated/prisma';

import {
  CreateTransactionInput,
  GetTransactionsInput,
  UpdateTransactionInput,
} from '../validators/transaction.validator';
import { paginate } from '../utils/pagination';

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

export const getTransactionsService = async (
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
    search,
    minAmount,
    maxAmount,
    from,
    to,
  } = parameters;

  const where: Prisma.TransactionWhereInput =
    {
      userId,

      ...(category && { category }),

      ...(type && { type }),

      ...((minAmount !== undefined ||
        maxAmount !== undefined) && {
        amount: {
          ...(minAmount !== undefined && {
            gte: minAmount,
          }),

          ...(maxAmount !== undefined && {
            lte: maxAmount,
          }),
        },
      }),

      ...((from || to) && {
        date: {
          ...(from && {
            gte: new Date(from),
          }),

          ...(to && {
            lte: new Date(to),
          }),
        },
      }),
    };

  if (search) {
    where.OR = [
      {
        category: {
          contains: search,
          mode: 'insensitive',
        },
      },

      {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const { skip, take } = paginate(
    page,
    limit
  );

  const [transactions, total] =
    await Promise.all([
      prisma.transaction.findMany({
        where,

        orderBy: {
          [sortBy]: order,
        },

        skip,

        take,
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
  updateTransactionService,
  deleteTransactionService,
};