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
  amount: string; // API returns string with 2 decimals
  type: AnalyticsType;
  category: string | null;
  date: string; // ISO string
  description?: string | null;
}

/** GET /analytics/summary */
export interface AnalyticsSummary {
  totalIncome: string; // 2-decimal string
  totalExpense: string;
  balance: string; // can be negative
  recentTransactions: RecentTransaction[];
}

/** GET /analytics/categories */
export interface CategoryAnalyticsItem {
  category: string | null;
  totalAmount: string; // 2-decimal string
  transactionCount: number;
  percentage: string; // 2-decimal string, e.g., "33.33"
}

export interface CategoryAnalyticsResponse {
  categories: CategoryAnalyticsItem[];
  recentTransactions: RecentTransaction[];
}

/** GET /analytics/monthly */
export interface MonthlyPoint {
  month: string; // YYYY-MM
  income: string; // 2-decimal string
  expense: string; // 2-decimal string
  balance: string; // 2-decimal string, can be negative
}

export interface MonthlyAnalyticsResponse {
  monthly: MonthlyPoint[];
  recentTransactions: RecentTransaction[];
}

/** GET /analytics/category-trends */
export interface CategoryTrendPoint {
  month: string;   // YYYY-MM
  category: string;
  amount: string; // 2-decimal string
}

export type CategoryTrendsResponse = CategoryTrendPoint[];
