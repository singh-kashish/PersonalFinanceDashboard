import { useQuery } from "@tanstack/react-query";
import type { CategoryTrendsQueryInput, CategoryTrendsResponse } from "../analytics.types";
import { analyticsKeys } from "./analytics.hooks";
import { getCategoryTrends } from "../api/analytics.api";

export const useCategoryTrends = (query: CategoryTrendsQueryInput = {}) =>
  useQuery<CategoryTrendsResponse>({
    queryKey: analyticsKeys.categoryTrends(query),
    queryFn: () => getCategoryTrends(query),
});
