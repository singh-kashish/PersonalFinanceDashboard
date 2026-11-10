# AGENTS.md — Flo

Flo is a personal finance tracker being grown into a multi-tenant finance
workspace (workspaces, RBAC, queues, realtime, AI assistant, Stripe billing).
It is the owner's flagship portfolio project, so correctness, clarity and
explainability matter more than speed. The owner must be able to explain every
line in an interview.

## 0. FIRST TASK: INSPECT BEFORE CHANGING ANYTHING

If no `docs/INSPECTION.md` exists, do this before any feature work.
This phase is READ-ONLY. Do not edit, install, migrate, or delete anything.

1. Read `README.md` and `Architecture-Design.md`. Note where they disagree with the code.
2. Read `server/package.json` and `web/package.json`. List the real scripts (dev, build, test, lint, typecheck) and the key dependencies and versions. Never assume a command or library exists; confirm it here.
3. Read `server/prisma/schema.prisma` and skim `server/prisma/migrations`. Note drift between the two.
4. Walk `server/src` folder by folder (`config`, `controllers`, `events`, `infra`, `middlewares`, `routes`, `services`, `tests`, `types`, `utils`, `validators`). For each, say what it actually contains and whether the layering (below) is respected. Pay special attention to what `events` and `infra` are (Redis? emitters? queues?).
5. Walk `web/src` (`features`, `routes`, `components`, `shared`, `lib`, `utils`). Note how routing, data fetching (TanStack Query), and client state (Zustand) are used, and where UI quality is weakest.
6. Run, and report results of: typecheck, lint, and the existing tests in both packages. Do not fix failures yet.
7. Check security basics and report (do not fix): how refresh tokens are stored (raw vs hashed), how passwords are hashed, cookie/JWT settings, CORS config, rate limiting, input validation coverage on every route, and whether any route reads or writes data without scoping by the authenticated user.
8. Check money handling: find every place `amount` is read, written, summed, or formatted. Flag any use of JS `number` arithmetic, `parseFloat`, `toFixed`, or `Number(...)` on money.
9. Never open, print, or quote `.env` files. Confirm only that they are gitignored.

Write the findings to `docs/INSPECTION.md` with these sections: What exists /
What is broken or incomplete / Risks (security, money, tenancy) / Missing tests /
Suggested order of work. Then STOP and wait for the owner's approval.

## 1. Stack and layout

- `server/`: Node, Express, TypeScript, Prisma, PostgreSQL (hosted on Neon), Redis, Jest.
- `web/`: React, TypeScript, Vite, TanStack Router (file-based), TanStack Query, Zustand, shadcn/ui.
- Generated, never hand-edit: `server/src/generated/**`, `web/src/routeTree.gen.ts`, `web/.tanstack/**`.
- Do not commit or modify `node_modules`, `.env`, or lockfiles except via the package manager.

## 2. Backend conventions

- Layering: `routes` (wiring only) → `controllers` (HTTP in/out, no business logic) → `services` (business logic and Prisma calls) → Prisma. Controllers never import Prisma directly.
- Validate every request body, query, and params in `validators` before it reaches a controller (use the validation library already in the repo).
- One error-handling path: throw typed errors in services; a single error middleware formats responses. No stray `res.status(500)` in controllers.
- New behavior needs a test in `server/src/tests`. Test the service layer and at least one HTTP-level happy path and one failure path.
- Schema changes go through `prisma migrate dev` with a descriptive name. Never edit an applied migration. Never run `migrate reset` or `db push` against anything but a local database. Confirm `DATABASE_URL` points to a local or throwaway DB before any destructive command.

## 3. Money rules (non-negotiable)

- Never use JS `number` for money arithmetic. No floats, no `toFixed` for calculations.
- Money is stored as fixed-precision `Decimal` in the database (use a bounded type such as `@db.Decimal(19, 2)` rather than the unbounded default) and handled in code with `Prisma.Decimal` / decimal.js. Amounts are always positive; direction comes from `type` (INCOME or EXPENSE).
- Every money value will eventually carry a `currency` (ISO 4217 code). Do not add currency-agnostic sums across currencies.
- All money math goes through one module (`server/src/utils/money.ts`). Nothing else adds, subtracts, rounds, or formats money.
- API responses send money as strings (e.g. `"450.75"`), never as floats. The frontend formats with `Intl.NumberFormat`.
- Rounding mode must be explicit wherever rounding happens.

## 4. Multi-tenancy rules (for the workspace work)

- Every tenant-owned table gets a non-null `workspaceId`. Every query on such a table must be scoped by it. There is no "get by id" without the tenant filter.
- Authorization is checked in the service layer through one `can(member, action, resource)` helper, not scattered `if (role === ...)` checks.
- Roles: OWNER, ADMIN, MEMBER, VIEWER. The UI hides what a role cannot do, but the server is the authority.
- Every tenancy feature ships with a test proving user A cannot read or write workspace B's data.

## 5. Security rules

- Never log tokens, passwords, or full request bodies for auth routes.
- Refresh tokens are stored hashed, rotated on use, and revoked on reuse. Any change to auth needs tests and the owner's explicit approval.
- Stripe (later): verify webhook signatures, make handlers idempotent (store processed event ids), and never trust client-sent plan or price info.
- Do not add dependencies without saying why. Prefer what is already installed.

## 6. Frontend conventions

- Feature-first: code lives in `web/src/features/<feature>` (components, hooks, api, types). Shared primitives go in `components` or `shared`.
- Server state in TanStack Query, UI-only state in Zustand. Do not copy server data into Zustand.
- Every screen handles loading, empty, error, and success states. Forms validate on the client and surface server errors.
- Use shadcn/ui components and the existing design tokens. Accessible by default: labels, focus states, keyboard navigation, sensible contrast.
- No `any`. Fix the type instead.

## 7. Git workflow

- One task per branch (`feat/...`, `fix/...`, `chore/...`). Never commit to `main` directly.
- Small commits with clear messages (Conventional Commits). Do not bundle refactors with features.
- Before finishing a task run, in the relevant package: typecheck, lint, tests. Report the results honestly, including failures.

## 8. How to work with the owner

- Plan first: for anything beyond a small fix, list the files you intend to change and why, then wait for approval.
- Keep diffs small and explain the reasoning behind non-obvious choices, since the owner needs to defend them.
- Ask before: changing the database schema, touching auth, adding a dependency, deleting files, or running anything that affects shared or remote data.
- If something in this file conflicts with what you find in the code, say so rather than guessing.
- Do not invent features, endpoints, or files that are not in the task. If a task is ambiguous, ask one specific question.

## 9. Roadmap (do not start items without being asked)

1. Finish core: transactions, categories, budgets, dashboard, UI polish, deploy.
2. Workspaces, invites, RBAC, tenant isolation tests.
3. Queues (BullMQ): CSV import, recurring transactions.
4. Realtime updates for workspace members (WebSocket or SSE).
5. AI assistant (natural-language entry and queries, streaming, tool calling against the existing API).
6. Stripe subscriptions and webhooks.
