// src/infra/redis.ts
import { createClient, RedisClientType } from 'redis';
import { env } from '../config/env';

export type AppRedisClient = RedisClientType;

let redisClient: AppRedisClient | null = null;

export function getRedis(): AppRedisClient {
  if (redisClient) return redisClient;

  const client: AppRedisClient = createClient({
    url: env.REDIS_URL,
  });

  client.on('error', (err: Error) => {
    console.error('Redis error:', err);
  });

  redisClient = client;
  return client;
}

export async function initRedis(): Promise<void> {
  const client = getRedis();
  await client.connect();
  console.log('Redis connected');
}

export async function shutdownRedis(): Promise<void> {
  if (!redisClient) return;
  await redisClient.quit();
  redisClient = null;
  console.log('Redis disconnected');
}
