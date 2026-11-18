import path from "path";
import dotenv from "dotenv";
import { assertTestDatabase } from "./testDbGuard";

// Point DOTENV_CONFIG_PATH to server/.env.test before any module loads src/config/env.
// This guarantees that any subsequent `import "dotenv/config"` inside application code
// loads only .env.test and cannot fall back to server/.env during test runs.
const envTestPath = path.resolve(__dirname, "../../../.env.test");
process.env.DOTENV_CONFIG_PATH = envTestPath;
dotenv.config({ path: envTestPath });

const dbUrl = process.env["DATABASE_URL"];
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy server/.env.test.example to server/.env.test"
  );
}

// Fail fast if someone accidentally pointed at Neon or a non-test DB.
assertTestDatabase(dbUrl);

// ---------------------------------------------------------------------------
// Database isolation convention:
// - Standard integration suites (*.int.test.ts) are isolated and reset tables
//   before each test (beforeEach).
// - Sequential journey suites (*.flow.int.test.ts) carry state across steps
//   (e.g., signup -> me -> refresh -> logout) and reset tables once per file
//   (beforeAll) instead.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

async function truncateTables() {
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

beforeAll(async () => {
  const testPath = expect.getState().testPath || "";
  if (testPath.endsWith(".flow.int.test.ts")) {
    await truncateTables();
  }
});

beforeEach(async () => {
  const testPath = expect.getState().testPath || "";
  if (!testPath.endsWith(".flow.int.test.ts")) {
    await truncateTables();
  }
});
