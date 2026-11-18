import jwt from "jsonwebtoken";

// Mock config/env so unit test does not need real env vars, a database, or server/.env
jest.mock("../config/env", () => ({
  env: {
    JWT_ACCESS_SECRET: "mock-access-secret-at-least-thirty-chars!!",
    JWT_REFRESH_SECRET: "mock-refresh-secret-at-least-thirty-chars!",
    JWT_ACCESS_EXPIRES: "15m",
    JWT_REFRESH_EXPIRES: "7d",
  },
}));

import { generateRefreshToken } from "./jwt";

describe("generateRefreshToken", () => {
  it("generates two back-to-back tokens for the same user that differ and carry a jti", () => {
    const payload = { userId: 42, email: "user@example.com" };

    const token1 = generateRefreshToken(payload);
    const token2 = generateRefreshToken(payload);

    // Without jti, tokens generated in the same second are identical.
    expect(token1).not.toEqual(token2);

    const decoded1 = jwt.decode(token1) as {
      userId: number;
      email: string;
      jti?: string;
    };
    const decoded2 = jwt.decode(token2) as {
      userId: number;
      email: string;
      jti?: string;
    };

    expect(decoded1.userId).toBe(payload.userId);
    expect(decoded2.userId).toBe(payload.userId);
    expect(decoded1.email).toBe(payload.email);
    expect(decoded2.email).toBe(payload.email);

    // Each token must carry a unique UUID jti
    expect(typeof decoded1.jti).toBe("string");
    expect(typeof decoded2.jti).toBe("string");
    expect(decoded1.jti).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(decoded2.jti).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(decoded1.jti).not.toEqual(decoded2.jti);
  });
});
