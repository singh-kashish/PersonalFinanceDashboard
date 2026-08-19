import { useQuery } from "@tanstack/react-query";
import type { AnalyticsQueryInput, CategoryAnalyticsResponse } from "../analytics.types";
import { analyticsKeys } from "./analytics.hooks";
import { getCategoryAnalytics } from "../api/analytics.api";

export const useCategoryAnalytics = (query: AnalyticsQueryInput = {}) =>
  useQuery<CategoryAnalyticsResponse>({
    queryKey: analyticsKeys.categories(query),
    queryFn: () => getCategoryAnalytics(query),
});