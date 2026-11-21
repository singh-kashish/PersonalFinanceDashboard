# Prompt for issue #6 (P3: Backend bug fixes)

Paste everything inside the block into any coding agent (Kilo Code, Antigravity, Claude Code...).

```text
Task: GitHub issue #6 (P3: Backend bug fixes). Work autonomously start to finish: no
plan-approval step. Read only AGENTS.md sections 7, 10 and 14, docs/INSPECTION.md
sections 2.2 and 3.1, and the files you touch. Use `git --no-pager`. Do not print raw
test logs or full diffs; report only summary lines.

Branch: `gh issue develop 6 --name fix/6-backend-bugs --base main --checkout` (start from
latest main with a clean tree). Do exactly the 7 fixes below, each as its own commit, test
FIRST (watch it fail, fix it, then commit test and fix together). Every commit must pass
`npm --prefix server run typecheck` and `npm --prefix server run test:unit -- --silent`;
`npm --prefix server run test:int` must pass after commits 1-3 and at the end.
Conventions: integration tests live in server/src/tests/*.int.test.ts (use
*.flow.int.test.ts only for chained journeys); unit tests are *.unit.test.ts next to the code.
Do not edit existing assertions. No other app-code changes: no lint cleanup, no refactors,
no new dependencies.

1. logoutAllController (server/src/controllers/auth.controller.ts): with no refreshToken
   cookie it never responds, and when nothing is deleted it throws AppError 400. Required:
   always respond 200 and clear the cookie (idempotent). If the route is authenticated,
   revoke every refresh token of req.auth's user; otherwise revoke by cookie when present.
   Integration tests: no cookie -> 200; valid cookie -> 200 and all the user's tokens gone;
   repeat call -> 200.
2. updateTransactionService (server/src/services/transaction.service.ts) returns undefined,
   so the controller sends no data. Required: return the updated transaction; an unknown id
   or another user's id -> AppError 404 with nothing changed; the update must be scoped by
   userId inside the query itself. Invalidate the analytics cache only after a successful
   write. Tests: update returns the row; other user's id -> 404; missing id -> 404.
3. createTransactionService: the create is not awaited before invalidateAnalyticsForUser
   runs. Required: await the write, invalidate only after it succeeds, never when it fails.
   Unit test with mocked Prisma and a spy on the invalidation (success -> called once, after
   the write; failure -> not called, error propagates).
4. getRecentTransactions (server/src/utils/analytics.utils.ts): `Math.min(Math.max(limit,
   50), 50)` always yields 50, and a utils file calls Prisma directly. Required: move the
   Prisma query into analytics.service.ts (utils must not import Prisma); default limit 50,
   clamp to [1, 50]; update callers. Unit tests for the clamp (0 -> 1, 10 -> 10, 999 -> 50,
   default 50).
5. error.middleware.ts leaks err.message for unexpected errors. Required: AppError and
   ZodError behave as today; any other error returns 500 with the generic message
   "Internal server error" plus the requestId, and the real error is only logged server-side;
   in NODE_ENV=development the detailed message may be returned. Unit tests: unexpected error
   in production -> generic; in development -> detailed; AppError unchanged.
6. /auth/signup is missing authLimiter (server/src/routes/auth.routes.ts). Required: apply it
   exactly as on login. Integration test in its own file (fresh app instance, so the
   in-memory limiter starts clean): the request after the limit returns 429. Do not weaken
   the limits.
7. Delete the empty stub files server/src/events/eventBus.js, server/src/config/db.js and
   server/src/utils/csvParser.js after proving by grep that nothing imports them.

Commit messages, in this order:
  fix(auth): make logout-all idempotent and revoke all sessions
  fix(transactions): return the updated row and scope updates by user
  fix(transactions): invalidate cache only after a successful create
  fix(analytics): clamp recent limit and move Prisma into the service
  fix(errors): hide internal error details outside development
  fix(auth): rate-limit signup like login
  chore(server): remove empty stub files

Finish: `git fetch origin && git rebase origin/main --exec "npm --prefix server run typecheck
--if-present && npm --prefix server run test:unit --if-present -- --silent"`, then
`git push --force-with-lease -u origin HEAD`. Open the PR from .github/pull_request_template.md
(title: "fix: backend bugs from the inspection report"; body: "Closes #6" plus one line per
fix); labels: type: fix, area: server, agent-generated, status: needs-review. Do not merge.
If something blocks you after two attempts, stop and put a BLOCKERS section in the PR
description instead of guessing.

Final message, at most 12 lines: PR URL, the commit list, the three test summary lines
(unit, integration, typecheck), and anything skipped or unverified.
```
