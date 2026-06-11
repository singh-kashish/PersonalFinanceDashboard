// utils/analytics.utils.ts
import prisma from '../lib/prisma';
import { AnalyticsQueryInput } from '../validators/analytics.validator';
import { TransactionType } from '../generated/prisma'; // adjust path if needed

export type AnalyticsFilter = {
  from: Date;
  to: Date;
  type?: TransactionType;
};

export const normalizeAnalyticsInput = (
  data: AnalyticsQueryInput
): AnalyticsFilter => {
  if (data.from && data.to) {
    return {
      from: new Date(data.from),
      to: new Date(data.to),
      ...(data.type && { type: data.type }),
    };
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1);

  return {
    from: startOfMonth,
    to: now,
    ...(data.type && { type: data.type }),
  };
};

export const getRecentTransactions = async (
  userId: number,
  filter: AnalyticsFilter,
  limit = 10
) => {
  const take = Math.min(Math.max(limit, 5), 15);

  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: filter.from,
        lte: filter.to,
      },
      ...(filter.type && { type: filter.type }),
    },
    orderBy: { date: 'desc' },
    take,
  });
};
