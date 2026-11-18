/**
 * Validates that a REDIS_URL points to the local docker-compose test Redis instance.
 *
 * Rules:
 *  1. Host must be "localhost" or "127.0.0.1".
 *  2. Port must be 6380 (the dedicated test Redis port from docker-compose;
 *     port 6379 may be used by local dev Redis or host services).
 *
 * Throws a descriptive Error if either check fails.
 */
export function assertTestRedis(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`REDIS_URL is not a valid URL: ${url}`);
  }

  const host = parsed.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `Test Redis host must be localhost or 127.0.0.1, got "${host}". ` +
        "Refusing to run tests against a remote Redis instance."
    );
  }

  const port = parsed.port;
  if (port !== "6380") {
    throw new Error(
      `Test Redis port must be 6380 (the dedicated docker-compose test Redis), got "${port || "default"}". ` +
        "Refusing to run tests against a non-test Redis instance."
    );
  }
}
