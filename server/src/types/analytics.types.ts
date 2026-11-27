export type AnalyticsFilter = {
  from: Date;
  to: Date;
  type?: 'INCOME' | 'EXPENSE';
};

export type AnalyticsFilterWithLimit = AnalyticsFilter & {
  limit?: number;
};

export type SummaryResult = {
  totalIncome: string;
  totalExpense: string;
  balance: string;
  recentTransactions: unknown[];
};

export type CategoryResult = {
  categories: {
    category: string;
    totalAmount: string;
    transactionCount: number;
    percentage: string;
  }[];
  recentTransactions: unknown[];
};

export type MonthlyResult = {
  monthly: {
    month: string;
    income: string;
    expense: string;
    balance: string;
  }[];
  recentTransactions: unknown[];
};

export type CategoryTrendsResult = {
  month: string;
  category: string;
  amount: string;
}[];
