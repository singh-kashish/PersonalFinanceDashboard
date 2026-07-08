import { getRedis } from "../../infra/redis";

const DEFAULT_ANALYTICS_VERSION = 1

async function getUserAnalyticsVersion(userId:number):Promise<number>{
    const client = getRedis();
    const key = `analytics:version:user:${userId}`;
    const value = await client.get(key);
    if(!value){
        // lazy init, treat as DEFAULT, but do not write to Redis yet.
        return DEFAULT_ANALYTICS_VERSION;
    }
    const num = Number(value);
    return Number.isFinite(num) && num>0 ? num : DEFAULT_ANALYTICS_VERSION;
}

async function bumpUserAnalyticsVersion(userId:number):Promise<void>{
    const client = getRedis();
    const key = `analytics:version:user:${userId}`
    // INCR is atomic and cheap
    await client.incr(key);
}

export {bumpUserAnalyticsVersion,getUserAnalyticsVersion}