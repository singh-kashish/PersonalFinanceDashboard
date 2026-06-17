// utils/analytics.utils.ts
import prisma from '../lib/prisma';
import { AnalyticsQueryInput, categoryTrendsQueryInput } from '../validators/analytics.validator';
import { TransactionType } from '../generated/prisma'; // adjust path if needed

export type AnalyticsFilter = {
  from: Date;
  to: Date;
  type?: TransactionType;
};

export type TrendsFilter = {
  from: Date;
  to: Date;
  category?: string;
}

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

export const normalizeTrendsInput = (data:categoryTrendsQueryInput):TrendsFilter =>{
  const now = new Date()
  if(data.from && data.to){
    return {
      from: new Date(data.from),
      to: new Date(data.to),
      ...(data.category&&{category:data.category})
    }
  }
  if(data.from){
    return{
      from: new Date(data.from),
      to: now,
      ...(data.category&&{category:data.category})
    }
  }
  if(data.to){
    const to = new Date(data.to)
    const from = new Date(to)
    from.setFullYear(from.getFullYear()-1)
    return{
      from,
      to,
      ...(data.category && {category:data.category}),
    }
  }
  const from = new Date(now)
  from.setFullYear(from.getFullYear()-1)
  return{
    from,
    to:now,
    ...(data.category && {category:data.category})
  }
}
