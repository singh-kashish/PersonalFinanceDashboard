import path from "path";
import dotenv from "dotenv";
import { assertTestRedis } from "./testRedisGuard";
import { migrateTestDatabase } from "./migrateTestDatabase";

/**
 * Jest globalSetup for the integration project.
 *
 * Runs once before any test file:
 *  1. Loads .env.test and validates REDIS_URL with test guard.
 *  2. Applies migrations with migrateTestDatabase() (which runs assertTestDatabase).
 */
export default async function globalSetup(): Promise<void> {
  const envPath = path.resolve(__dirname, "../../../.env.test");
  dotenv.config({ path: envPath, override: true });

  const redisUrl = process.env["REDIS_URL"];
  if (!redisUrl) {
    throw new Error(
      "REDIS_URL is not set. Copy server/.env.test.example to server/.env.test"
    );
  }

  assertTestRedis(redisUrl);

  // Validates DATABASE_URL and executes prisma migrate deploy
  migrateTestDatabase({ envPath });
}
