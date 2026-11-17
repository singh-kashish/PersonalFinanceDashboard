import { useQuery } from "@tanstack/react-query";
import type { AnalyticsQueryInput, MonthlyAnalyticsResponse } from "../analytics.types";
import { analyticsKeys } from "./analytics.hooks";
import { getMonthlyAnalytics } from "../api/analytics.api";

export const useMonthlyAnalytics = (query: AnalyticsQueryInput = {}) =>
  useQuery<MonthlyAnalyticsResponse>({
    queryKey: analyticsKeys.monthly(query),
    queryFn: () => getMonthlyAnalytics(query),
  });