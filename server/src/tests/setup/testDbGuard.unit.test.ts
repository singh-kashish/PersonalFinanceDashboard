import { assertTestDatabase } from "./testDbGuard";

describe("assertTestDatabase", () => {
  it("passes for localhost with _test suffix", () => {
    expect(() =>
      assertTestDatabase(
        "postgresql://flo:flo_local@localhost:5443/flo_test"
      )
    ).not.toThrow();
  });

  it("passes for 127.0.0.1 with _test suffix", () => {
    expect(() =>
      assertTestDatabase(
        "postgresql://flo:flo_local@127.0.0.1:5443/flo_test"
      )
    ).not.toThrow();
  });

  it("throws for a Neon-style remote URL", () => {
    expect(() =>
      assertTestDatabase(
        "postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/flo"
      )
    ).toThrow(/must be localhost/);
  });

  it("throws for a remote host even if db name ends in _test", () => {
    expect(() =>
      assertTestDatabase(
        "postgresql://user:pass@db.example.com:5432/flo_test"
      )
    ).toThrow(/must be localhost/);
  });

  it("throws when the db name does not end in _test", () => {
    expect(() =>
      assertTestDatabase(
        "postgresql://flo:flo_local@localhost:5443/flo_dev"
      )
    ).toThrow(/must end with "_test"/);
  });

  it("throws for an invalid URL", () => {
    expect(() => assertTestDatabase("not-a-url")).toThrow(
      /not a valid URL/
    );
  });
});
