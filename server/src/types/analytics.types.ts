// utils/analytics.types.ts

export type AnalyticsFilter = {
  from: Date;
  to: Date;
  type?: 'INCOME' | 'EXPENSE';
};

export type AnalyticsFilterWithLimit = AnalyticsFilter & {
  limit?: number;
};

export type SummaryResult = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: unknown[];
};

export type CategoryResult = {
  categories: {
    category: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
  }[];
  recentTransactions: unknown[];
};

export type MonthlyResult = {
  monthly: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
  recentTransactions: unknown[];
};

export type CategoryTrendsResult = {
  month: string;
  category: string;
  amount: number;
}[];

