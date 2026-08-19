import { useQuery } from "@tanstack/react-query";
import type { AnalyticsQueryInput, AnalyticsSummary } from "../analytics.types";
import { getAnalyticsSummary } from "../api/analytics.api";
import { analyticsKeys } from "./analytics.hooks";

export const useAnalyticsSummary = (query: AnalyticsQueryInput = {}) =>
  useQuery<AnalyticsSummary>({
    queryKey: analyticsKeys.summary(query),
    queryFn: () => getAnalyticsSummary(query),
});