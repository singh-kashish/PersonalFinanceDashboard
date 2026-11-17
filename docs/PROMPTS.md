# Flo — TDD Prompt Pack

Use with Kilo Code or Antigravity. One prompt per session, one branch per prompt.
Review every diff. For prompts 4–7 read the code line by line: you must be able to defend it in an interview.

---

## A. Add this block to AGENTS.md (Testing policy)

```md
## 10. Testing policy (TDD, mandatory)

Workflow for every change: RED (write a failing test, run it, confirm it fails
for the right reason) → GREEN (smallest change to pass) → REFACTOR (tests stay
green). Commit the failing test and the fix separately when practical
(`test: ...` then `feat:` / `fix:`). Never weaken, skip, or delete a test to make
it pass. If a test seems wrong, explain why and ask first.

Test pyramid and tools:
- Unit (server: Jest; web: Vitest): pure logic, services with mocked I/O, money module, validators, hooks. Fast, no network, no DB.
- Property-based (fast-check): money math and any parsing/formatting logic.
- Integration (server: Jest + Supertest): real HTTP stack against the real local Postgres and Redis from docker-compose (never Neon). Cover happy path, validation failure, auth failure, forbidden/cross-user access, and not-found for every route.
- Component (web: Vitest + React Testing Library + MSW): behavior through the UI (roles, labels), not implementation details. Mock the network with MSW, not by stubbing hooks.
- End-to-end / feature automation (Playwright): real browser against the real local stack for critical user journeys. Include axe accessibility checks on main pages.
- Security: dedicated suite (`server/src/tests/security/`) covering authz/IDOR, auth bypass, token tampering and reuse, rate limits, input abuse (SQLi/XSS payloads, oversized bodies, malformed JSON), and error-message leakage. CI also runs dependency audit, secret scanning, and static analysis.

Rules:
- Tests must be deterministic and isolated: each test creates its own data; the DB is reset between test files; no test depends on order, wall-clock time, or the network.
- Test databases: only `localhost` hosts and database names ending in `_test` are allowed. Test setup must throw otherwise.
- Coverage thresholds are enforced in CI (start at 80% lines on services and utils, raise over time).
- Bug fixes start with a regression test that reproduces the bug.
- Definition of done: typecheck, lint, unit, integration all green locally; e2e green for any user-facing change.
```

---

## B. Shared preamble (paste at the top of EVERY prompt below)

```text
Read AGENTS.md and docs/INSPECTION.md first. Follow the Testing policy (TDD:
red, green, refactor). Your task is GitHub issue #<N>; its spec is the matching
prompt in docs/PROMPTS.md. Follow the Git and GitHub workflow in AGENTS.md
section 7 exactly (start from latest main, branch via the issue, open a PR at
the end, do not merge). Before writing
code, show me a short plan listing the files you will touch and the tests you
will write, then wait for my approval. Keep commits small. Do not touch
anything outside this task's scope. When done, run typecheck, lint and tests
and report the real output, including any failures.
```

---

## C. Prompts

### 1. Local infrastructure and test harness (branch: chore/local-infra-tests)

```text
Goal: a safe local dev and test environment. Nothing may use the remote Neon database for tests.

1. Create docker-compose.yml at the repo root with: postgres:16-alpine for dev
   (host port 5442 -> container 5432, named volume, healthcheck, db flo_dev), a
   second postgres:16-alpine for tests (host port 5443 -> 5432, db flo_test, data
   on tmpfs, healthcheck), and redis:7-alpine (host port 6380 -> 6379, healthcheck).
   The host ports deliberately avoid 5432 and 6379 because other Postgres/Redis
   instances may already run on this machine. Use these ports in the .env examples.
   Credentials via environment, defaults only for local use.
2. Add server/.env.example and server/.env.test.example documenting DATABASE_URL,
   TEST_DATABASE_URL, REDIS_URL, JWT secrets, NODE_ENV. Do not read or edit my real
   .env files. Confirm .env and .env.test are gitignored.
3. Add NODE_ENV (development|test|production) to the Zod schema in config/env.ts and
   use env.NODE_ENV in CookieOptions.ts instead of process.env.
4. Jest: ignore dist/, split into two projects "unit" and "integration" with separate
   roots/testMatch (unit: src/**/*.unit.test.ts, integration: src/tests/**/*.int.test.ts),
   a globalSetup that runs `prisma migrate deploy` against the test DB, and a setup
   file that (a) throws unless the DB URL host is localhost and the db name ends in
   _test, (b) truncates all tables between test files. Rename existing tests to fit.
5. Add server scripts: typecheck (tsc --noEmit), lint (set up ESLint with typescript-eslint
   and eslint-plugin-security), test:unit, test:int, test, test:coverage, db:up, db:down,
   db:test:migrate. Add the same typecheck script to web.
6. Update README with a "Local development" section (docker compose up -d, migrate, run).
Tests for this task: a test proving the setup guard throws for a Neon-style URL and
passes for the local test URL.
```

### 2. CI pipeline (branch: chore/ci)

```text
Create .github/workflows/ci.yml that runs on pull requests and pushes to main:
jobs for server (typecheck, lint, unit, integration with postgres:16 and redis:7 as
service containers, coverage upload as artifact) and web (typecheck, lint, test,
build). Add a separate security job: npm audit --audit-level=high for both packages,
gitleaks secret scan, and CodeQL for JavaScript/TypeScript. Use Node LTS with npm
caching. Pin action versions. Do not add secrets; CI must run with only local
service containers. Add a CI status badge to README.
```

### 3. Backend bug fixes (branch: fix/backend-bugs)

```text
Fix these bugs from docs/INSPECTION.md, one at a time, each as: failing regression
test (commit) then fix (commit):
a) logoutAllController hangs when the refreshToken cookie is missing, and throws
   AppError 400 when deleted.count is 0. Expected: always respond 200/204 and clear
   cookies; if an access token identifies the user, revoke all that user's refresh tokens.
b) updateTransactionService returns undefined; controller must return the updated
   transaction. Also verify ownership (cannot update another user's transaction -> 404).
c) createTransactionService must await prisma.transaction.create before invalidating
   the analytics cache; cache must NOT be invalidated if the write fails (test with a
   mocked failing Prisma call).
d) getRecentTransactions take calculation is wrong (always 50). Expected: clamp limit
   between 1 and 50. Move the Prisma call out of utils into a service.
e) error.middleware must not leak err.message for unexpected errors outside
   development; return a generic message plus request id. Test it.
f) Apply authLimiter to /auth/signup. Test that the 21st request in the window is 429.
g) Delete the empty stub files (eventBus.js, db.js, csvParser.js) after confirming
   nothing imports them.
```

### 4. Money module (branch: feat/money-module)

```text
Create server/src/utils/money.ts, strictly test-first. Use Prisma.Decimal (decimal.js).
API: parseMoney(input: string | Decimal) with validation (positive, max 2 decimal
places, bounded magnitude, reject NaN/Infinity/exponent notation/floats-as-number),
add, subtract, sum(list), percentage(part, total, scale) with explicit rounding mode
(ROUND_HALF_EVEN, document why), toApiString(money) returning "450.75" (always 2
decimals), compare. No function accepts or returns a JS number for money.
Tests: unit tests with edge cases (0, huge values, 0.1+0.2, negative results,
percentage of zero total) AND fast-check property tests (commutativity of add,
sum equals fold of add, a+b-b == a, round-trip parse/toApiString). Aim for 100%
coverage of this file. Replace utils/decimal.ts usages only in the NEXT task; do
not touch analytics here.
```

### 5. Decimal(19,2) migration and input validation (branch: feat/money-schema)

```text
1. First write a read-only SQL/script check (do NOT run against anything but the
   local dev DB) that reports any Transaction.amount with more than 2 decimal places.
   Show me the query and wait.
2. Change schema.prisma: Transaction.amount -> @db.Decimal(19, 2). Generate a named
   migration. Add a CHECK constraint (amount > 0) via a raw SQL migration.
3. transaction.validator.ts: replace z.coerce.number() with a Zod schema that accepts
   a decimal STRING only (regex, max 2 dp, positive, bounded), using money.parseMoney.
   Reject JSON numbers with a clear 400.
4. Update transaction.service to use the money module. Update existing tests and add
   new ones: valid string, number rejected, 3 decimals rejected, zero/negative
   rejected, huge value rejected, SQL-looking strings rejected.
5. Update the OpenAPI/Swagger docs for the new contract.
```

### 6. Analytics refactor (branch: refactor/analytics-money)

```text
Refactor analytics.service.ts so ALL aggregation uses money.ts and responses
serialize money as strings ("450.75"). Prefer database aggregation (Prisma
aggregate/groupBy or raw SQL with SUM) over loading rows into JS where it is
simpler and more precise. Write tests FIRST for: empty user, single transaction,
many transactions with fractional sums (0.1/0.2 style), income vs expense balance,
category percentages summing to 100.00 with a documented remainder rule, month
boundaries (UTC), user isolation (user A's data never appears for user B), and
cache behavior: second call served from cache, cache invalidated after
create/update/delete, per-user version isolation. Update the web hooks' types to
strings only in a separate small commit.
```

### 7. Security hardening and security test suite (branch: feat/security-suite)

```text
Create server/src/tests/security/ with integration tests (write them first; some
will fail until you fix the code, fix only what is needed):
- IDOR/authz: for every transactions and analytics route, user B gets 404/403 for
  user A's resource ids; unauthenticated requests get 401.
- Auth: expired, malformed, wrong-secret, alg=none, and tampered JWTs are rejected;
  refresh token reuse after rotation is rejected and revokes the token family;
  logout-all invalidates refresh tokens; login does not reveal whether an email exists.
- Rate limits: login, refresh, signup return 429 after the threshold.
- Input abuse: oversized JSON body rejected; malformed JSON returns 400 not 500;
  SQL-injection and XSS payload strings in category/description are stored and
  returned inert (no 500, no unescaped reflection); unexpected extra fields are stripped.
- Headers/CORS: helmet headers present; CORS rejects unknown origins.
- Error hygiene: no stack traces or Prisma messages in any 4xx/5xx response.
Also: raise password minimum to 10 characters (length over complexity rules; also
reject the most common passwords via a small denylist), set explicit cookie flags
(httpOnly, secure in production, sameSite) and test them.
```

### 8. Web tooling and cleanup (branch: chore/web-tooling)

```text
1. Fix the 5 TypeScript build errors and 17 ESLint errors from docs/INSPECTION.md
   without suppressing rules: replace any with real types, remove unused code.
2. Add scripts: typecheck, test, test:watch, test:coverage.
3. Install and configure Vitest, @testing-library/react, @testing-library/user-event,
   @testing-library/jest-dom, jsdom, and MSW. Create a test utils file with a render
   helper wrapping QueryClientProvider and the router.
4. Write tests first for: useAuthStore bootstrap flow, the single-flight refresh
   queue in apiClient (many concurrent 401s trigger exactly one refresh; queued
   requests retry with the new token; refresh failure logs the user out), and the
   offline/server-unreachable circuit breaker store.
5. Move the access token out of localStorage into memory only (bootstrap from the
   refresh cookie on load). Update tests accordingly.
```

### 9. Transactions API layer and hooks (branch: feat/web-transactions-data)

```text
In web/src/features/transactions: implement transactions.types.ts (money as string),
transactions.api.ts (list with filters and pagination, get, create, update, delete),
and TanStack Query hooks (useTransactions with query keys including filters,
useCreateTransaction, useUpdateTransaction, useDeleteTransaction). Mutations must do
optimistic updates with rollback on error and invalidate analytics queries on
success. Write tests first with MSW covering: success, 401 -> refresh -> retry,
validation error mapping, optimistic update then rollback on 500, cache invalidation.
```

### 10. Transactions page (branch: feat/web-transactions-page)

```text
Create the /transactions route and page using shadcn/ui: a table with pagination,
filters (type, category, date range), search, sortable date and amount, skeleton
loading, empty state, error state with retry, and mobile layout (cards or
horizontal scroll). Money formatted with Intl.NumberFormat from decimal strings via
one shared formatMoney helper (unit tested). Filters sync to URL search params
(TanStack Router validateSearch with Zod). Write React Testing Library tests first
for each state and for filter-to-URL behavior. Accessibility: proper table
semantics, labeled controls, keyboard navigation.
```

### 11. Add/Edit/Delete flows (branch: feat/web-transaction-forms)

```text
Add a dialog form for creating and editing a transaction using react-hook-form and
the Zod schema (amount as a string with max 2 decimals, type, category, date,
description), with inline errors, server error display, disabled submit while
pending, focus management, and Escape to close. Add a delete confirmation dialog.
Toasts via sonner. Tests first (RTL + user-event + MSW): validation messages, submit
success updates the list, server 400 shows field errors, edit prefill, delete
confirm and cancel.
```

### 12. End-to-end tests with Playwright (branch: test/e2e)

```text
Set up Playwright in a top-level e2e/ folder. Config starts the API and web against
the docker test database via webServer, with a script that resets and seeds the test DB.
Write journeys: signup -> login -> create transaction -> see it in the list and
dashboard totals -> edit -> delete; logout; session survives page reload (refresh
cookie flow); login rate limit shows a friendly message; offline banner appears
when the API is unreachable; user B cannot see user A's data. Add @axe-core/playwright
checks for login, dashboard, transactions, and analytics. Run in CI with traces and
screenshots uploaded on failure. Tests must be non-flaky: no fixed sleeps, use
auto-waiting locators, unique data per test.
```

### 13. Dashboard, Analytics and Settings pages (branch: feat/web-dashboard)

```text
Replace the mock CashFlowChart with a real chart (Recharts via the shadcn chart
component) using useMonthlyAnalytics; build AnalyticsPage with category breakdown
and category trends from the existing hooks; build a minimal Settings page (profile
name, logout all sessions, theme). Every page handles loading, empty, and error
states. Tests first for data-to-chart mapping helpers and page states, plus extend
the Playwright suite with the dashboard and analytics journeys.
```

### 14. Deploy and portfolio polish (branch: chore/deploy-docs)

```text
Prepare production deploy: Dockerfile for the server (multi-stage, non-root user,
healthcheck), environment validation, a production build of web, and a deploy
guide in README for [fill in: Render/Railway/Fly + Vercel/Netlify/S3+CloudFront].
Update README: feature list, screenshots placeholder list, architecture diagram
(Mermaid), test pyramid and how to run each suite, security measures, and fix the
broken ARCHITECTURE.md link. Update Architecture-Design.md so every claim matches
the code (especially the money section).
```

### 15. Workspaces and RBAC (branch: feat/workspaces) — start only after 1–14

```text
Add Workspace and WorkspaceMember (OWNER, ADMIN, MEMBER, VIEWER) plus Invitation
(email, role, hashed token, expiry, accepted_at). Add non-null workspaceId to
Transaction with a data migration that creates a personal workspace per existing
user. Implement can(member, action, resource) in one module with an exhaustive
permission matrix and a table-driven unit test covering every role x action.
Scope every query by workspaceId at the service layer. Tests first: a tenant
isolation suite proving user A cannot read, update, delete, or aggregate
workspace B's data across ALL routes (including analytics and cache keys), role
enforcement (VIEWER cannot write, MEMBER cannot invite, ADMIN cannot remove the
OWNER), invitation expiry and single use, and e2e invite-and-accept flow.
```

---

## D. Design and decision prompts (reusable)

Paste the shared preamble (section B) before each of these. Prompts 10, 11 and 13
build UI, so for each screen run D1 first, make your choices, then D2. D2 replaces
the "build" part of those prompts; their data/hook work (prompt 9) still comes first.

### D1. Design fit report (no code) — one session per screen

```text
Screen: <name, e.g. transactions>. Issue: #<N>.
Follow AGENTS.md section 11, Session 1. Inspect docs/design/<screen>/ (reference
images, figma.txt, notes.md). Write docs/design/<screen>/FIT.md exactly as section
11 specifies, including options with pros/cons for every element that is not a
direct fit with shadcn/ui + Tailwind v4, and a "simplify the design" option each
time. Check the existing components in web/src before proposing new ones. Do NOT
write any implementation code or install anything. Commit only FIT.md, open the PR
per the Git workflow, then stop and ask me for my decisions.
```

### D2. Implement the approved screen (TDD)

```text
Screen: <name>. Issue: #<N>. My decisions are recorded at the bottom of
docs/design/<screen>/FIT.md. Follow AGENTS.md section 11, Session 2. Write the
tests first (unit, component with axe checks, integration with MSW, Playwright
journey and screenshot tests at 375/768/1280), watch them fail, then implement with
shadcn/ui and existing Tailwind tokens only. Anything outside the approved plan:
stop and ask. Finish with docs/design/<screen>/REVIEW.md (built vs reference
screenshots per breakpoint, honest deviation list). Report real test output.
```

### R. Decision brief (use whenever a choice comes up)

```text
Decision needed: <one line, e.g. "How should the web app store the access token?">.
Follow AGENTS.md section 12. Give me a decision brief: context, 2 to 4 options
(always include the simplest, and do not favor what the code already does), pros,
cons, best-when, cost to reverse, interview defensibility, what a large company
would do versus what fits Flo, your recommendation, what would change it, and where
your claims come from (label common practice versus your judgement; flag anything
unverified). Do not write any code. I will choose; then record it as an ADR.
```

### Decisions you will probably face (ask for a brief on each when you get there)

- Access-token storage: in memory plus refresh cookie versus httpOnly cookies only.
- Money storage: keep Decimal(19,2) versus integer minor units (record the current choice as ADR 0001).
- Multi-tenancy: shared tables with workspaceId (plus Postgres RLS or not) versus schema-per-tenant.
- Realtime: SSE versus WebSockets (versus polling).
- Queue: BullMQ on Redis versus a Postgres-based queue.
- Sharing types and Zod schemas between server and web.
- Hosting and deployment targets.
- AI assistant design: tool calling against the API versus text-to-SQL (strongly prefer the former; ask for a brief).
