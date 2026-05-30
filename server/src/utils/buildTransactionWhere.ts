// buildTransactionWhere.ts

import { Prisma } from "../generated/prisma";
import { GetTransactionsInput } from "../validators/transaction.validator";

export const buildTransactionWhere = (
  filters: GetTransactionsInput,
  userId: number
): Prisma.TransactionWhereInput => {
  const {
    category,
    minAmount,
    maxAmount,
    from,
    to,
    type,
    search,
  } = filters;

  const where: Prisma.TransactionWhereInput = {
    userId,

    ...(category && {
      category,
    }),

    ...(type && {
      type,
    }),

    ...(
      (minAmount !== undefined ||
        maxAmount !== undefined) && {
        amount: {
          ...(minAmount !== undefined && {
            gte: minAmount,
          }),

          ...(maxAmount !== undefined && {
            lte: maxAmount,
          }),
        },
      }
    ),

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
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
};