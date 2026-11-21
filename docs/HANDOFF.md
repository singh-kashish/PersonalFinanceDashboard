# Handoff: Flo (PersonalFinanceDashboard)

Read this first. It lets any engineer or AI agent continue without the chat history.

## Goal and owner
Portfolio project to win SDE-1 / frontend / full-stack interviews (Bengaluru, hybrid or
remote). Flo is a personal finance tracker growing into a multi-tenant workspace app
(RBAC, queues, realtime, AI assistant, Stripe). Owner: Kash (GitHub: singh-kashish).
Quality bar: interview-defensible code, tests first, small atomic commits.

## Repo map
- `server/`: Express 5, TypeScript, Prisma 6, PostgreSQL, Redis, Jest (+ Supertest).
- `web/`: Vite, React 19, TanStack Router and Query, Zustand, Tailwind 4, shadcn/ui.
- `AGENTS.md`: the rules every agent must follow (sections 0 to 15). `docs/INSPECTION.md`:
  known bugs and risks. `docs/PROMPTS.md`: the spec for issues P1 to P17 plus the reusable
  prompts D1, D2 and R. `docs/RUNBOOK.md`: the end-to-end plan. `docs/adr/`: decisions.
- `scripts/gh-bootstrap.sh` (labels, milestones, issues), `scripts/pr-audit.sh` (audit a branch).

## Local environment
- `docker compose up -d` starts postgres-dev (5442), postgres-test (5443, tmpfs) and redis (6380).
- `server/.env` -> dev DB on 5442 and Redis on 6380 (never Neon). `server/.env.test` -> test DB
  on 5443 and Redis on 6380. Both gitignored; copy from the `.env*.example` files.
- Test guards refuse to run unless the DB host is localhost, the DB name ends in `_test` and
  Redis is localhost:6380. Do not weaken them.
- `npm --prefix server run test:unit | test:int | typecheck | lint`. Integration tests run
  serially; files named `*.flow.int.test.ts` reset the DB once per file, all others per test.

## Workflow (full rules: AGENTS.md section 7)
One GitHub issue -> one branch (`gh issue develop <N> --name <type>/<N>-<slug> --base main
--checkout`) -> small atomic Conventional Commits, each passing typecheck, lint and tests ->
`git fetch origin && git rebase origin/main --exec "<fast checks>"` -> `git push
--force-with-lease` -> PR with "Closes #N" -> the owner merges with `gh pr merge <PR> --rebase`.
Agents never merge, never push to main, never touch real `.env` files.

## Status (update this table in the PR that finishes each item)
| Issue | Item | Status |
|---|---|---|
| #4 | P1 local infra and test harness | PR #23, verify with `gh pr view 23` |
| #5 | P2 CI pipeline | files in the p2-p4 kit; apply, then check the Actions run |
| #6 | P3 backend bug fixes | prompt in `docs/prompts/P3-backend-bug-fixes.md` |
| #7 | P4 money module | files in the p2-p4 kit (steps 1 to 3 + ADR 0001) |
| #8 | P5 Decimal(19,2) migration | todo, needs P4 |
| #9 | P6 analytics refactor | todo, needs P4 and P5 |
| #10 | P7 security suite | todo, needs P3 |
| #11 | P8 web tooling and cleanup | todo |
| #12 to #18 | P9 to P15 | see docs/PROMPTS.md |
| P16, P17 | hosting decision, CI/CD | created by gh-bootstrap |
Check real state any time: `gh issue list --state all --limit 30` and `gh pr list --state all`.

## Decisions already made
- Rebase-and-merge with atomic commits (squash only for a messy branch).
- Money: numeric(19,2) in Postgres, decimal.js in code, strings in the API (ADR 0001).
- Tests: serial integration runs against Docker Postgres/Redis; never against Neon.
- Refresh tokens carry a unique `jti`; `*.flow.int.test.ts` convention for chained journeys.
- Frontend: UI/data separation with custom hooks, memoization only with evidence, no leaks
  (AGENTS.md section 13). Backend resource hygiene: section 14. Environments: section 15.

## Known gotchas
- Web typecheck/lint/build fail until P8 (see INSPECTION.md); CI marks them non-blocking.
- Server lint has 11 existing errors (unused imports); a follow-up issue tracks them.
- `getRecentTransactions` had a broken clamp (fixed in P3). Error middleware still logs full
  stacks, which is noisy in tests (`test:int` is silent by default).
- Neon is the future production DB only; never put its URL in a local env file.

## How to continue with any agent
1. Open the next unblocked issue (`gh issue view <N>`), read its spec in docs/PROMPTS.md.
2. Paste the preamble from docs/PROMPTS.md section B (set the issue number), or a prompt file
   from `docs/prompts/`.
3. After the agent finishes: `scripts/pr-audit.sh` then review `/tmp/pr-audit.txt`.
4. Merge with `gh pr merge <PR> --rebase`; `git switch main && git pull --ff-only`.
