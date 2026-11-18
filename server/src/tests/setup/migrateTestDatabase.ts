import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";
import { assertTestDatabase } from "./testDbGuard";

export interface MigrateOptions {
  envPath?: string;
  cwd?: string;
  runner?: (
    command: string,
    options: {
      cwd?: string;
      env?: NodeJS.ProcessEnv;
      stdio?: "inherit" | "pipe";
    }
  ) => void;
}

/**
 * Validates that DATABASE_URL points to a local test database and applies migrations.
 *
 * Guaranteed to execute assertTestDatabase BEFORE any migration command is run.
 */
export function migrateTestDatabase(options: MigrateOptions = {}): void {
  const envPath =
    options.envPath || path.resolve(__dirname, "../../../.env.test");
  dotenv.config({ path: envPath, override: true });

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy server/.env.test.example to server/.env.test"
    );
  }

  // Guard: throws if not localhost or name doesn't end in _test
  assertTestDatabase(dbUrl);

  const runner = options.runner || execSync;
  const cwd = options.cwd || path.resolve(__dirname, "../../..");

  runner("npx prisma migrate deploy", {
    cwd,
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });
}

// Allow direct CLI execution via ts-node
if (require.main === module) {
  migrateTestDatabase();
}
