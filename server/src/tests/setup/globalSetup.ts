import { execSync } from "child_process";
import path from "path";
import { assertTestDatabase } from "./testDbGuard";
import { assertTestRedis } from "./testRedisGuard";

/**
 * Jest globalSetup for the integration project.
 *
 * Runs once before any test file:
 *  1. Loads .env.test so DATABASE_URL points to the local test DB.
 *  2. Validates DATABASE_URL and REDIS_URL with test guards.
 *  3. Applies migrations with `prisma migrate deploy`.
 */
export default async function globalSetup(): Promise<void> {
  // Load test environment variables
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "../../../.env.test") });

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy server/.env.test.example to server/.env.test"
    );
  }

  assertTestDatabase(dbUrl);

  const redisUrl = process.env["REDIS_URL"];
  if (!redisUrl) {
    throw new Error(
      "REDIS_URL is not set. Copy server/.env.test.example to server/.env.test"
    );
  }

  assertTestRedis(redisUrl);

  // Run migrations against the test database
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, "../../.."),
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });
}
