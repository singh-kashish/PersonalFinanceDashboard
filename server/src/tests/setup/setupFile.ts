import path from "path";
import dotenv from "dotenv";
import { assertTestDatabase } from "./testDbGuard";

// Load .env.test before anything else (including Prisma client init via env.ts).
dotenv.config({ path: path.resolve(__dirname, "../../../.env.test") });

const dbUrl = process.env["DATABASE_URL"];
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy server/.env.test.example to server/.env.test"
  );
}

// Fail fast if someone accidentally pointed at Neon or a non-test DB.
assertTestDatabase(dbUrl);

// ---------------------------------------------------------------------------
// Truncate all tables between test files so each file starts with a clean DB.
// We import Prisma lazily to ensure the env is loaded first.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Delete in FK-safe order: children first, then parents.
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});
