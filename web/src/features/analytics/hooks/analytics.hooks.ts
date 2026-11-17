// src/features/analytics/analytics.hooks.ts
import type{
  AnalyticsQueryInput,
  CategoryTrendsQueryInput,
} from '../analytics.types.ts';

export const analyticsKeys = {
  summary: (q: AnalyticsQueryInput = {}) => ['analytics', 'summary',  q.from,q.to,q.type] as const,
  categories: (q: AnalyticsQueryInput = {}) => ['analytics', 'categories',  q.from,q.to,q.type] as const,
  monthly: (q: AnalyticsQueryInput = {}) => ['analytics', 'monthly', q.from,q.to,q.type] as const,
  categoryTrends: (q: CategoryTrendsQueryInput = {}) =>
    ['analytics', 'category-trends', q.category,q.from,q.to] as const,
};






