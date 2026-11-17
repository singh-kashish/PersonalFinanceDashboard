// src/features/analytics/analytics.api.ts

import { apiClient } from '@/lib/apiClient';
import type {
  AnalyticsQueryInput,
  CategoryTrendsQueryInput,
  AnalyticsSummary,
  CategoryAnalyticsResponse,
  MonthlyAnalyticsResponse,
  CategoryTrendsResponse,
  ApiSuccess,
} from '../analytics.types.ts';

const withCreds = { withCredentials: true };

// GET /analytics/summary
export const getAnalyticsSummary = async (
  query: AnalyticsQueryInput = {},
): Promise<AnalyticsSummary> => {
  const res = await apiClient.get<ApiSuccess<AnalyticsSummary>>(
    '/analytics/summary',
    {
      params: query,
      ...withCreds,
    },
  );
  return res.data.data;
};

// GET /analytics/categories
export const getCategoryAnalytics = async (
  query: AnalyticsQueryInput = {},
): Promise<CategoryAnalyticsResponse> => {
  const res = await apiClient.get<ApiSuccess<CategoryAnalyticsResponse>>(
    '/analytics/categories',
    {
      params: query,
      ...withCreds,
    },
  );
  return res.data.data;
};

// GET /analytics/monthly
export const getMonthlyAnalytics = async (
  query: AnalyticsQueryInput = {},
): Promise<MonthlyAnalyticsResponse> => {
  const res = await apiClient.get<ApiSuccess<MonthlyAnalyticsResponse>>(
    '/analytics/monthly',
    {
      params: query,
      ...withCreds,
    },
  );
  return res.data.data;
};

// GET /analytics/category-trends
export const getCategoryTrends = async (
  query: CategoryTrendsQueryInput = {},
): Promise<CategoryTrendsResponse> => {
  const res = await apiClient.get<ApiSuccess<CategoryTrendsResponse>>(
    '/analytics/category-trends',
    {
      params: query,
      ...withCreds,
    },
  );
  return res.data.data;
};
