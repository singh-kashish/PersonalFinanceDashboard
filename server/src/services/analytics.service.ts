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
    toNumber(incomeResult._sum.amount ?? 0);

  const totalExpense =
    toNumber(expenseResult._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense,
    balance:
      totalIncome - totalExpense,
  };
}

export const categoryService = async (data:AnalyticsQueryInput, userId:number) => {
    
}

export const monthlyService = async (data:AnalyticsQueryInput, userId:number) => {
    
}