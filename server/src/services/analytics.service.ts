import { AnalyticsQueryInput } from "../validators/analytics.validator"
import prisma from "../lib/prisma"
import { getDateRange } from "../utils/analytics.utils"
import { toNumber } from "../utils/decimal";

export const summaryService = async (data:AnalyticsQueryInput, userId:number) => {
    const {from,to} = getDateRange(data.from,data.to);
    const where = {
        userId,
        date:{
            gte:from, // greater than
            lte:to // less than to
        }
    }
    const [incomeResult,expenseResult] = await Promise.all([
        prisma.transaction.aggregate({
            where:{
                ...where,
                type:"INCOME"
            },
            _sum:{
                amount:true
            }
    }),
      prisma.transaction.aggregate({
            where:{
                ...where,
                type:"EXPENSE"
            },
            _sum:{
                amount:true
            }
    }) 
]);
const totalIncome =
    toNumber(incomeResult._sum.amount);

  const totalExpense =
    toNumber(expenseResult._sum.amount);

  return {
    totalIncome,
    totalExpense,
    balance:
      totalIncome - totalExpense,
  };
}

export const categoryService = async (data:AnalyticsQueryInput, userId:number) => {
    const {from,to} = getDateRange(data.from,data.to);
    const where = {
        userId,
        date:{
            gte:from,
            lte:to
        },
        ...(data.type && {type:data.type})
    };
    const categories =
    await prisma.transaction.groupBy({
      by: ['category'],

      where,

      _sum: {
        amount: true,
      },

      _count: {
        id: true,
      },

      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });
    return categories.map((item) => ({
    category: item.category,

    totalAmount: toNumber(
      item._sum.amount
    ),

    transactionCount: item._count.id,
  }));
}

export const monthlyService = async (
  data: AnalyticsQueryInput,
  userId: number
) => {
  const { from, to } = getDateRange(
    data.from,
    data.to
  );

  const transactions =
    await prisma.transaction.findMany({
      where: {
        userId,

        date: {
          gte: from,
          lte: to,
        },

        ...(data.type && {
          type: data.type,
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
    const month =
      tx.date.toISOString().slice(0, 7); 

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

  return Array.from(map.entries())
    .map(([month, value]) => ({
      month,
      income: value.income,
      expense: value.expense,
      balance:
        value.income - value.expense,
    }))
    .sort((a, b) =>
      a.month.localeCompare(b.month)
    );
};