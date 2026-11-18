import { execSync } from "child_process";
import path from "path";
import { assertTestDatabase } from "./testDbGuard";

/**
 * Jest globalSetup for the integration project.
 *
 * Runs once before any test file:
 *  1. Loads .env.test so DATABASE_URL points to the local test DB.
 *  2. Validates the URL with assertTestDatabase.
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

  // Run migrations against the test database
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, "../../.."),
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });
}
