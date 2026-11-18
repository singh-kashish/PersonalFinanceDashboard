import { assertTestRedis } from "./testRedisGuard";

describe("assertTestRedis", () => {
  it("passes for localhost with port 6380", () => {
    expect(() => assertTestRedis("redis://localhost:6380")).not.toThrow();
  });

  it("passes for 127.0.0.1 with port 6380", () => {
    expect(() => assertTestRedis("redis://127.0.0.1:6380")).not.toThrow();
  });

  it("throws for a remote host", () => {
    expect(() => assertTestRedis("redis://redis.example.com:6380")).toThrow(
      /must be localhost or 127.0.0.1/
    );
  });

  it("throws for port 6379", () => {
    expect(() => assertTestRedis("redis://localhost:6379")).toThrow(
      /must be 6380/
    );
  });

  it("throws for invalid URL", () => {
    expect(() => assertTestRedis("not-a-valid-url")).toThrow(
      /not a valid URL/
    );
  });
});
