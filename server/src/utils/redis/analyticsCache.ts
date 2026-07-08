import type { AnalyticsQueryInput,categoryTrendsQueryInput } from "../../validators/analytics.validator";
import { bumpUserAnalyticsVersion } from "./analyticsCacheVersion";
import { buildCategoryKey,buildMonthlyKey,buildSummaryKey,buildCategoryTrendsKey } from "./analyticsCacheKey";
import { getAnalyticsCache,setAnalyticsCache } from "./baseCache";
import { MonthlyResult,CategoryResult,CategoryTrendsResult,SummaryResult } from "../../types/analytics.types";
const ANALYTICS_TTL_SECONDS = 120;

export async function getSummaryCache(
  userId: number,
  query: AnalyticsQueryInput
): Promise<SummaryResult | null> {
  const key = await buildSummaryKey(userId, query);
  return getAnalyticsCache<SummaryResult>(key);
}

export async function setSummaryCache(
  userId: number,
  query: AnalyticsQueryInput,
  value: SummaryResult
): Promise<void> {
  const key = await buildSummaryKey(userId, query);
  await setAnalyticsCache(key, value, ANALYTICS_TTL_SECONDS);
}

export async function getCategoryCache(
  userId: number,
  query: AnalyticsQueryInput
): Promise<CategoryResult | null> {
  const key = await buildCategoryKey(userId, query);
  return getAnalyticsCache<CategoryResult>(key);
}

export async function setCategoryCache(
  userId: number,
  query: AnalyticsQueryInput,
  value: CategoryResult
): Promise<void> {
  const key = await buildCategoryKey(userId, query);
  await setAnalyticsCache(key, value, ANALYTICS_TTL_SECONDS);
}

export async function getMonthlyCache(
  userId: number,
  query: AnalyticsQueryInput
): Promise<MonthlyResult | null> {
  const key = await buildMonthlyKey(userId, query);
  return getAnalyticsCache<MonthlyResult>(key);
}

export async function setMonthlyCache(
  userId: number,
  query: AnalyticsQueryInput,
  value: MonthlyResult
): Promise<void> {
  const key = await buildMonthlyKey(userId, query);
  await setAnalyticsCache(key, value, ANALYTICS_TTL_SECONDS);
}

export async function getCategoryTrendsCache(
  userId: number,
  query: categoryTrendsQueryInput
): Promise<CategoryTrendsResult | null> {
  const key = await buildCategoryTrendsKey(userId, query);
  return getAnalyticsCache<CategoryTrendsResult>(key);
}

export async function setCategoryTrendsCache(
  userId: number,
  query: categoryTrendsQueryInput,
  value: CategoryTrendsResult
): Promise<void> {
  const key = await buildCategoryTrendsKey(userId, query);
  await setAnalyticsCache(key, value, ANALYTICS_TTL_SECONDS);
}

/**
 * Single entry point to invalidate analytics for a user.
 * Implemented as version bump, so it's O(1) and scalable.
 */
export async function invalidateAnalyticsForUser(userId: number): Promise<void> {
  await bumpUserAnalyticsVersion(userId);
}
