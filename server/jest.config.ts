import type { Config } from "jest";

const config: Config = {
  // Never pick up compiled JS from dist/
  modulePathIgnorePatterns: ["<rootDir>/dist/"],

  projects: [
    // ── Unit tests ──────────────────────────────────────────────
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "node",
      clearMocks: true,
      testMatch: ["<rootDir>/src/**/*.unit.test.ts"],
    },

    // ── Integration tests ───────────────────────────────────────
    {
      displayName: "integration",
      preset: "ts-jest",
      testEnvironment: "node",
      clearMocks: true,
      testMatch: ["<rootDir>/src/tests/**/*.int.test.ts"],
      globalSetup: "<rootDir>/src/tests/setup/globalSetup.ts",
      setupFilesAfterEnv: ["<rootDir>/src/tests/setup/setupFile.ts"],
    },
  ],
};

export default config;
