/**
 * Validates that a PostgreSQL DATABASE_URL points to a local test database.
 *
 * Rules:
 *  1. Host must be "localhost" or "127.0.0.1".
 *  2. Database name must end with "_test".
 *
 * Throws a descriptive Error if either check fails.
 */
export function assertTestDatabase(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `DATABASE_URL is not a valid URL: ${url}`
    );
  }

  const host = parsed.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `Test database host must be localhost or 127.0.0.1, got "${host}". ` +
        "Refusing to run tests against a remote database."
    );
  }

  // The pathname starts with "/", so strip the leading slash to get the db name.
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Test database name must end with "_test", got "${dbName}". ` +
        "Refusing to run tests against a non-test database."
    );
  }
}
