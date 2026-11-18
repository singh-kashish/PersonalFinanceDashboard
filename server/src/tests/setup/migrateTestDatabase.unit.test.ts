import fs from "fs";
import path from "path";
import os from "os";
import { migrateTestDatabase } from "./migrateTestDatabase";

describe("migrateTestDatabase", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "migrate-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("throws for a Neon-style URL BEFORE running any command", () => {
    const fakeEnvTest = path.join(tmpDir, ".env.test");
    fs.writeFileSync(
      fakeEnvTest,
      "DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/flo\n"
    );

    const mockRunner = jest.fn();

    expect(() => {
      migrateTestDatabase({
        envPath: fakeEnvTest,
        runner: mockRunner,
      });
    }).toThrow(/must be localhost/);

    // Verify runner was NEVER called
    expect(mockRunner).not.toHaveBeenCalled();
  });

  it("calls runner when DATABASE_URL is a valid local test DB", () => {
    const fakeEnvTest = path.join(tmpDir, ".env.test");
    fs.writeFileSync(
      fakeEnvTest,
      "DATABASE_URL=postgresql://flo:flo_local@localhost:5443/flo_test\n"
    );

    const mockRunner = jest.fn();

    expect(() => {
      migrateTestDatabase({
        envPath: fakeEnvTest,
        runner: mockRunner,
      });
    }).not.toThrow();

    expect(mockRunner).toHaveBeenCalledTimes(1);
    expect(mockRunner).toHaveBeenCalledWith(
      "npx prisma migrate deploy",
      expect.objectContaining({
        env: expect.objectContaining({
          DATABASE_URL: "postgresql://flo:flo_local@localhost:5443/flo_test",
        }),
      })
    );
  });
});
