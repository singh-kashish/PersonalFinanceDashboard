import { AnalyticsQueryInput, categoryTrendsQueryInput } from '../validators/analytics.validator';
import prisma from '../infra/prisma';
import { parseMoney, add, subtract, sum, allocatePercentages, toApiString, Money } from '../utils/money';
import {
  normalizeAnalyticsInput,
  clampRecentLimit,
  normalizeTrendsInput,
} from '../utils/analytics.utils';
import { Prisma } from '../generated/prisma';
import { TransactionType } from '../generated/prisma';
import {
  getSummaryCache, setSummaryCache,
  getCategoryCache, setCategoryCache,
  getMonthlyCache, setMonthlyCache,
  getCategoryTrendsCache, setCategoryTrendsCache
} from '../utils/redis/analyticsCache';

const ZERO = parseMoney('0', { allowZero: true });

const getRecentTransactions = async (
  userId: number,
  filter: { from: Date; to: Date; type?: TransactionType },
  limit?: number
) => {
  const take = clampRecentLimit(limit);

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

// SUMMARY
export const summaryService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const cached = await getSummaryCache(userId, data);
  if (cached) return cached;

  const filter = normalizeAnalyticsInput(data);

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

  const totalIncome = incomeResult._sum.amount
    ? parseMoney(incomeResult._sum.amount.toString())
    : ZERO;
  const totalExpense = expenseResult._sum.amount
    ? parseMoney(expenseResult._sum.amount.toString())
    : ZERO;

  const balance = subtract(totalIncome, totalExpense);

  const result = {
    totalIncome: toApiString(totalIncome),
    totalExpense: toApiString(totalExpense),
    balance: toApiString(balance),
    recentTransactions,
  };
  await setSummaryCache(userId, data, result);
  return result;
};

// CATEGORY
export const categoryService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const cached = await getCategoryCache(userId, data);
  if (cached) return cached;

  const filter = normalizeAnalyticsInput(data);

  const where = {
    userId,
    date: {
      gte: filter.from,
      lte: filter.to,
    },
    ...(filter.type && { type: filter.type }),
  };

  const [categories, recentTransactions] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    }),

    getRecentTransactions(userId, filter, 10)
  ]);

  const categoryAmounts: Money[] = categories.map(item =>
    item._sum.amount ? parseMoney(item._sum.amount.toString()) : ZERO
  );

  const totalCategoryAmount = sum(categoryAmounts);

  const percentages = totalCategoryAmount.isZero()
    ? categoryAmounts.map(() => ZERO)
    : allocatePercentages(categoryAmounts);

  const result = {
    categories: categories.map((item, index) => {
      const totalAmount = item._sum.amount
        ? parseMoney(item._sum.amount.toString())
        : ZERO;
      return {
        category: item.category,
        totalAmount: toApiString(totalAmount),
        transactionCount: item._count.id,
        percentage: toApiString(percentages[index]!),
      };
    }),
    recentTransactions
  };
  await setCategoryCache(userId, data, result);
  return result;
};

// MONTHLY
export const monthlyService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const cached = await getMonthlyCache(userId, data);
  if (cached) return cached;

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
      income: Money;
      expense: Money;
    }
  >();

  for (const tx of transactions) {
    const month = tx.date.toISOString().slice(0, 7);

    if (!map.has(month)) {
      map.set(month, {
        income: ZERO,
        expense: ZERO,
      });
    }

    const entry = map.get(month)!;
    const amount = parseMoney(tx.amount.toString());

    if (tx.type === 'INCOME') {
      entry.income = add(entry.income, amount);
    } else {
      entry.expense = add(entry.expense, amount);
    }
  }

  const recentTransactions = await getRecentTransactions(userId, filter, 50);

  const monthly = Array.from(map.entries())
    .map(([month, value]) => ({
      month,
      income: toApiString(value.income),
      expense: toApiString(value.expense),
      balance: toApiString(subtract(value.income, value.expense)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const result = {
    monthly,
    recentTransactions,
  };
  await setMonthlyCache(userId, data, result);
  return result;
};

export const categoryTrendsService = async (
  data: categoryTrendsQueryInput,
  userId: number
) => {
  const cached = await getCategoryTrendsCache(userId, data);
  if (cached) return cached;

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
    month: item.month.toISOString().slice(0, 7),
    category: item.category,
    amount: toApiString(parseMoney(item.amount.toString())),
  }));

  await setCategoryTrendsCache(userId, data, trends);
  return trends;
};
