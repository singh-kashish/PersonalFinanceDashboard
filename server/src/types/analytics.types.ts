// utils/analytics.types.ts

export type AnalyticsFilter = {
  from: Date;
  to: Date;
  type?: 'INCOME' | 'EXPENSE';
};

export type AnalyticsFilterWithLimit = AnalyticsFilter & {
  limit?: number;
};
