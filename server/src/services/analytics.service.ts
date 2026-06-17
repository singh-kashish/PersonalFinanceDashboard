// src/services/analytics.service.ts

import { AnalyticsQueryInput, categoryTrendsQueryInput } from '../validators/analytics.validator';
import prisma from '../infra/prisma';
import { toNumber } from '../utils/decimal';
import {
  normalizeAnalyticsInput,
  getRecentTransactions,
  normalizeTrendsInput,
} from '../utils/analytics.utils';
import { Prisma } from '../generated/prisma';

// SUMMARY
export const summaryService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const filter = normalizeAnalyticsInput(data); // { from, to, type? }

  const baseWhere = {
    userId,
    date: {
      gte: filter.from,
      lte: filter.to,
    },
  };

  const [incomeResult, expenseResult, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        type: 'EXPENSE',
      },
      _sum: {
        amount: true,
      },
    }),
    getRecentTransactions(userId, filter, 10),
  ]);

  const totalIncome = toNumber(incomeResult._sum.amount);
  const totalExpense = toNumber(expenseResult._sum.amount);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    recentTransactions,
  };
};

// CATEGORY
export const categoryService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const filter = normalizeAnalyticsInput(data);

  const where = {
    userId,
    date: {
      gte: filter.from,
      lte: filter.to,
    },
    ...(filter.type && { type: filter.type }),
  };

  const [categories, recentTransactions] =
  await Promise.all([
    prisma.transaction.groupBy({
      by:['category'],
      where,
      _sum:{
        amount:true
      },
      _count:{
        id:true
      },
      orderBy:{
        _sum:{
          amount:'desc'
        }
      }
    }),

    getRecentTransactions(
      userId,
      filter,
      10
    )
  ]);
  const totalCategoryAmount =
  categories.reduce(
    (acc,item)=>
      acc +
      toNumber(
        item._sum.amount
      ),
    0
  );

  return {
  categories: categories.map(
    (item)=>{

      const totalAmount =
        toNumber(
          item._sum.amount
        );

      return {
        category:item.category,

        totalAmount,

        transactionCount:
          item._count.id,

        percentage:
           totalCategoryAmount > 0
      ? Number(
          (
            (totalAmount / totalCategoryAmount) * 100
          ).toFixed(2)
        )
      : 0,
      };
    }
  ),

  recentTransactions
};
};

// MONTHLY
export const monthlyService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const filter = normalizeAnalyticsInput(data);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: filter.from,
        lte: filter.to,
      },
      ...(filter.type && {
        type: filter.type,
      }),
    },
    select: {
      amount: true,
      type: true,
      date: true,
    },
  });

  const map = new Map<
    string,
    {
      income: number;
      expense: number;
    }
  >();

  for (const tx of transactions) {
    const month = tx.date.toISOString().slice(0, 7); // YYYY-MM

    if (!map.has(month)) {
      map.set(month, {
        income: 0,
        expense: 0,
      });
    }

    const entry = map.get(month)!;
    const amount = toNumber(tx.amount);

    if (tx.type === 'INCOME') {
      entry.income += amount;
    } else {
      entry.expense += amount;
    }
  }

  const recentTransactions = await getRecentTransactions(userId, filter, 10);

  const monthly = Array.from(map.entries())
    .map(([month, value]) => ({
      month,
      income: value.income,
      expense: value.expense,
      balance: value.income - value.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    monthly,
    recentTransactions,
  };
};

export const categoryTrendsService = async(data:categoryTrendsQueryInput,userId:number) =>{
  const normalizedInputs = normalizeTrendsInput(data);
  const categoryFilter =
    normalizedInputs.category
      ? Prisma.sql`AND category = ${normalizedInputs.category}`
      : Prisma.empty;

  const groups = await prisma.$queryRaw<
    {
      month: Date;
      category: string;
      amount: Prisma.Decimal;
    }[]
  >(
    Prisma.sql`
      SELECT
        DATE_TRUNC('month', date) AS month,
        category,
        SUM(amount)::numeric AS amount
      FROM "Transaction"
      WHERE
        "userId" = ${userId}
        AND date BETWEEN ${normalizedInputs.from}
        AND ${normalizedInputs.to}
        ${categoryFilter}
      GROUP BY
        DATE_TRUNC('month', date),
        category
      ORDER BY
        month ASC
    `
  );
  const trends = groups.map(item => ({
      month:
        item.month.toISOString().slice(0,7),
      category:
        item.category,
      amount:
        toNumber(item.amount)
      }));
      
  return trends
}