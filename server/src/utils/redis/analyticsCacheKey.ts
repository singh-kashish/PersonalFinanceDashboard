import type { AnalyticsQueryInput,categoryTrendsQueryInput } from "../../validators/analytics.validator";
import { normalizeAnalyticsInput, normalizeTrendsInput } from "./../analytics.utils";
import { getUserAnalyticsVersion } from "./analyticsCacheVersion";

const buildSummaryKey = async (userId:number,query:AnalyticsQueryInput) : Promise<string> => {
    const version = await getUserAnalyticsVersion(userId);
    const filter = normalizeAnalyticsInput(query);
    const from = filter.from.toISOString();
    const to = filter.to.toISOString();
    const type = filter.type ?? 'ALL';
    return `analytics:v${version}:user:${userId}:summary:from:${from}:to:${to}:type:${type}`;
}

const buildCategoryKey = async (userId:number,query:AnalyticsQueryInput) : Promise<string> =>{
    const version = await getUserAnalyticsVersion(userId);
    const filter = normalizeAnalyticsInput(query);
    const from = filter.from.toISOString();
    const to = filter.to.toISOString();
    const type = filter.type ?? 'ALL';
    return `analytics:v${version}:user:${userId}:categories:from:${from}:to:${to}:type:${type}`;
}

const buildMonthlyKey = async(userId:number,query:AnalyticsQueryInput) : Promise<string> =>{
    const version = await getUserAnalyticsVersion(userId);
    const filter = normalizeAnalyticsInput(query);
    const from = filter.from.toISOString();
    const to = filter.to.toISOString();
    const type = filter.type ?? 'ALL';
    return `analytics:v${version}:user:${userId}:monthly:from:${from}:to:${to}:type:${type}`;
}

const buildCategoryTrendsKey = async(userId:number,query:categoryTrendsQueryInput):Promise<string> =>{
    const version = await getUserAnalyticsVersion(userId);
    const filter = normalizeTrendsInput(query);
    const from = filter.from.toISOString();
    const to = filter.to.toISOString();
    const category = filter.category ?? 'ALL';
    return `analytics:v${version}:user:${userId}:category-trends:from:${from}:to:${to}:category:${category}`;
}

export {buildCategoryTrendsKey, buildMonthlyKey, buildCategoryKey, buildSummaryKey};