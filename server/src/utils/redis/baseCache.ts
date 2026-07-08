import { getRedis } from "../../infra/redis";
import { bumpUserAnalyticsVersion } from "./analyticsCacheVersion";

export async function getAnalyticsCache<T>(key:string):Promise<T|null>{
    const client = getRedis();
    let cached:string|null;
    try{
        cached = await client.get(key)
    } catch(err){
        // Fail open: just skip cache if Redis is unhealthy
        console.error('Redis GET failed for key', key, err);
        return null;
    }
    if(!cached) return null;
    try{
        return JSON.parse(cached) as T;
    } catch(err){
        console.error('Failed to parse analytics cache value for key', key, err);
        return null;
    }
}

export async function setAnalyticsCache<T>(key:string,value:T,ttlSeconds:number):Promise<void>{
    const client = getRedis();
    const json = JSON.stringify(value)
    try{
        await client.set(key,json, {
            EX: ttlSeconds,
        });
    } catch(err){
        // Do not fail requests if Redis is down
        console.error('Redis SET failed for key', key, err);
    }
    
}
// Invalidate analytics by bumping the version, not by scanning/deleting keys
export async function invalidateAnalyticsForUser(userId:number):Promise<void>{
    await bumpUserAnalyticsVersion(userId);
}