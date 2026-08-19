// src/features/analytics/analytics.hooks.ts
import type{
  AnalyticsQueryInput,
  CategoryTrendsQueryInput,
} from '../analytics.types.ts';

export const analyticsKeys = {
  summary: (q: AnalyticsQueryInput = {}) => ['analytics', 'summary', q] as const,
  categories: (q: AnalyticsQueryInput = {}) => ['analytics', 'categories', q] as const,
  monthly: (q: AnalyticsQueryInput = {}) => ['analytics', 'monthly', q] as const,
  categoryTrends: (q: CategoryTrendsQueryInput = {}) =>
    ['analytics', 'category-trends', q] as const,
};






