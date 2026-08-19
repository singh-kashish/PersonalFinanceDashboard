// src/features/analytics/analytics.types.ts

export type AnalyticsType = 'INCOME' | 'EXPENSE';

export interface AnalyticsQueryInput {
  from?: string; // ISO datetime
  to?: string;   // ISO datetime
  type?: AnalyticsType;
}

export interface CategoryTrendsQueryInput {
  from?: string; // ISO datetime
  to?: string;   // ISO datetime
  category?: string;
}

// Generic API success envelope
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

// Adjust fields to match your getRecentTransactions shape
export interface RecentTransaction {
  id: number;
  amount: number;
  type: AnalyticsType;
  category: string | null;
  date: string; // ISO string
  description?: string | null;
}

/** GET /analytics/summary */
export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: RecentTransaction[];
}

/** GET /analytics/categories */
export interface CategoryAnalyticsItem {
  category: string | null;
  totalAmount: number;
  transactionCount: number;
  percentage: number; // 0–100
}

export interface CategoryAnalyticsResponse {
  categories: CategoryAnalyticsItem[];
  recentTransactions: RecentTransaction[];
}

/** GET /analytics/monthly */
export interface MonthlyPoint {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

export interface MonthlyAnalyticsResponse {
  monthly: MonthlyPoint[];
  recentTransactions: RecentTransaction[];
}

/** GET /analytics/category-trends */
export interface CategoryTrendPoint {
  month: string;   // YYYY-MM
  category: string;
  amount: number;
}

export type CategoryTrendsResponse = CategoryTrendPoint[];
