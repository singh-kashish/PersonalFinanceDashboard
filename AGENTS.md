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

## 7. Git and GitHub workflow (mandatory)

Model: trunk-based development. `main` is always deployable. One GitHub issue
becomes one short-lived branch and one pull request. PRs are merged with
rebase-and-merge, so every atomic commit lands on `main` (squash only when the
owner asks, for a messy branch). Branches live a day or two, never longer.

### Naming

- Branch: `<type>/<issue-number>-<kebab-slug>`, for example `feat/6-money-module`.
- Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `security`.
- Commits and PR titles: Conventional Commits, `type(scope): imperative subject`,
  72 characters or fewer.

### Commits: small, atomic, always green

- One commit is one logical change (one behavior, one refactor, one migration),
  usually 20 to 300 changed lines, and it includes its own tests.
- Every commit must pass typecheck, lint and the tests, so `main` stays bisectable.
  In TDD, watch the test fail locally (red), then commit the test and its
  implementation together once green. Never commit a deliberately failing test alone.
- Add a 1 to 4 line body when the reason is not obvious: explain why, not what.
- Never use "wip", "fix", "update", "misc", or commits that mix unrelated changes,
  and never one giant commit for a whole task. If a task needs more than about 10
  commits or 600 changed lines, stop and propose splitting the issue.
- Example for a money module: `feat(money): add parseMoney with validation and tests`,
  then `feat(money): add add/subtract/sum with property tests`, then
  `feat(money): add percentage with explicit rounding`, then
  `docs(adr): record money storage decision`.
- To fix a mistake in an earlier commit: `git commit --fixup <sha>`, then
  `GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash origin/main`, then
  `git push --force-with-lease` (own branch only).
- Before opening the PR, run `git log --oneline origin/main..HEAD` and include the
  list in your report.

### Start of every task (do these in order)

1. `git status --porcelain` must print nothing. If it does, STOP and tell me.
2. `git switch main && git pull --ff-only`.
3. `gh issue view <N>` and read it. If I did not give an issue number, STOP and ask.
4. Create the linked branch: `gh issue develop <N> --name <type>/<N>-<slug> --base main --checkout`
   (fallback: `git switch -c <type>/<N>-<slug>`).
5. `gh issue edit <N> --add-label "status: in-progress"`.

### During the task

- Commit as you complete each logical change. Push after the first commit and after
  each milestone (`git push -u origin HEAD`).
- Never push to `main`. Never force-push except `--force-with-lease` on your own
  branch. Do not merge `main` into the branch; if `main` moved, `git rebase origin/main`.
- Stay in scope. If you find extra work, do NOT do it: open a new issue with
  `gh issue create` (title, type and area labels, short description) and mention
  it in the PR. `git diff --stat origin/main...HEAD` must show only files relevant
  to the issue.
- Each branch starts from the latest `main`. Do not start the next issue until the
  previous PR is merged, unless I explicitly ask for a stacked PR (then base it on
  the previous branch and say so in the PR description).

### Finishing a task

1. Run the full typecheck, lint and tests; report the real output.
2. Bring the branch up to date and prove every commit is green, in one step:
   `git fetch origin && git rebase origin/main --exec "<fast checks>"`, where the fast
   checks are typecheck plus unit tests for the packages you touched (for example
   `npm --prefix server run typecheck && npm --prefix server run test:unit`). If a
   commit fails, fix it with `git commit --fixup <sha>` and
   `GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash origin/main`, then repeat.
   Never run `git pull origin main` or merge `main` into the branch: the branch must
   stay a straight line of commits on top of the latest `main`.
3. `git push --force-with-lease -u origin HEAD` (own branch only).
4. Open the PR: `gh pr create --base main --title "<conventional title>"` with the
   body filled in from `.github/pull_request_template.md` (including `Closes #<N>`).
   The PR's Commits tab must show exactly the commits that will land on `main`.
   Add labels: the issue's type and area labels, plus `agent-generated`.
5. `gh pr checks --watch` and report the result.
6. `gh issue edit <N> --remove-label "status: in-progress"` and
   `gh pr edit --add-label "status: needs-review"`.
7. Print the PR URL and the commit list, then STOP. Do NOT merge, do NOT close the
   issue, do NOT delete branches. I review and merge (rebase-and-merge).

### Never do without asking first

`git reset --hard`, `git clean -fd`, `git push --force`, `git branch -D`,
deleting remote branches, rewriting history on `main`, changing GitHub settings,
labels, milestones or branch protection, or running `gh` commands that edit
issues or PRs other than the ones named in this section.

### If a session goes wrong (for the human)

- Throw the work away: `git switch main && git branch -D <branch> && git push origin --delete <branch>`.
- Recover lost commits: `git reflog`, then `git switch -c rescue <sha>`.
- Nothing the agent does on a branch can affect `main` until you merge its PR.

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

## 10. Testing policy (TDD, mandatory)

Workflow for every change: RED (write a failing test, run it, confirm it fails
for the right reason) → GREEN (smallest change to pass) → REFACTOR (tests stay
green). Commit each behavior as one atomic commit containing its test and its
implementation (see section 7); never commit a deliberately failing test on its own. Never weaken, skip, or delete a test to make
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
- Integration database resets: isolated test suites reset tables in `beforeEach` by default; multi-step journey files named `*.flow.int.test.ts` carry state across sequential steps and reset once in `beforeAll` instead.
- Test databases: only `localhost` hosts and database names ending in `_test` are allowed. Test setup must throw otherwise.
- Coverage thresholds are enforced in CI (start at 80% lines on services and utils, raise over time).
- Bug fixes start with a regression test that reproduces the bug.
- Definition of done: typecheck, lint, unit, integration all green locally; e2e green for any user-facing change.

## 11. Design-to-code workflow

Screen designs are generated with an AI design tool and refined in Figma. They are
direction, not law: some elements may not be buildable with our stack (React,
Tailwind v4, shadcn/ui, Radix, Recharts). Never invent a design when no reference
exists; ask for one.

Inputs live in `docs/design/<screen>/`: `reference.png` (plus `mobile.png`,
`dark.png` if they exist), optional `figma.txt` (link), optional `notes.md`.
If your tool can read Figma through MCP you may use it, but the PNGs in the repo
are the source of truth.

Every screen takes TWO sessions.

### Session 1: Fit report (NO code)

Write `docs/design/<screen>/FIT.md` with these sections, then STOP and wait:

1. Purpose and main user flows (3 lines).
2. Element inventory table: element | implementation (shadcn component, Tailwind
   pattern, or existing repo component) | fit (Direct / Adapt / New component /
   Needs dependency / Not feasible) | notes.
3. Design tokens used (colors, type scale, radius, spacing, shadows) mapped to our
   existing Tailwind theme and CSS variables; list tokens that are missing.
4. States: loading, empty, error, disabled, hover, focus, dark mode, long text,
   many rows. Say which the design covers and which it does not.
5. Responsive behavior at 375, 768 and 1280 px (what collapses or reflows).
6. Accessibility problems in the design (contrast ratios, tap target sizes,
   focus order, missing labels).
7. For EVERY item not marked Direct: 2 to 3 options, each with pros, cons, effort
   (S/M/L), dependency or bundle impact, and accessibility impact. Always include a
   "simplify the design" option. Give a recommendation and why.
8. Proposed component tree, file list, and test plan.
9. Questions for the owner.

The owner records choices under a "Decisions" heading at the bottom. If a choice
adds a dependency or a new pattern, also follow section 12.

### Session 2: Implement (only after the owner's decisions), TDD

- Use shadcn/ui via `npx shadcn@latest add <component>` (allowed; list what you
  added in the PR). Use only existing Tailwind theme tokens: no arbitrary hex
  colors, no inline styles, no `!important`. No new UI library, icon set, or font
  without approval.
- Keep code in `web/src/features/<feature>/` (components, hooks, api, types).
  Extract shared components only when used in two places.
- Tests, written first:
  - Unit (Vitest): formatters, mappers, view-model builders, Zod schemas.
  - Component (React Testing Library + user-event): every state from the fit
    report, interactions, form validation, keyboard operation. Query by role and
    label. Add an axe check (vitest-axe) per state: zero violations.
  - Integration (Vitest + RTL + MSW + real router + real QueryClient): page-level
    flows, i.e. load data, render, filter or mutate, optimistic update and
    rollback, error handling.
  - E2E (Playwright): the user journey, plus screenshot tests at 375, 768 and
    1280 px (and dark mode if designed). Committed snapshots guard against
    regressions; they are not compared with the AI reference.
  - jsdom has no layout engine, so do not claim responsive behavior is tested by
    component tests. Responsive checks belong in Playwright.
- Finish with `docs/design/<screen>/REVIEW.md`: screenshots of the built screen
  next to `reference.png` at each breakpoint, and an honest list of deviations
  and why. The owner reviews that before merging.

## 12. Decision protocol (architecture and design choices)

The owner makes every significant decision. Your job is to give a balanced
briefing, not to decide.

### When it applies

Stop and brief before implementing anything that is hard to reverse or shapes the
codebase: data model and tenancy approach, auth and session handling, API style,
state management, caching, realtime transport, queue choice, error-handling
strategy, new dependencies, folder structure changes, testing approach, deployment
target, and similar. Small local choices (naming, a helper function) do not need
a brief: decide, and mention them in the PR.

### Decision brief (post in chat, wait for the answer)

1. Context and constraints: Flo's stack, solo developer, portfolio scale, deadline.
2. Options (2 to 4). ALWAYS include the simplest option, including "do nothing
   yet". Do not favor whatever the code already does. For each option: how it
   works in two lines, pros, cons, when it is the right choice, cost to reverse
   later, and how defensible it is in a technical interview.
3. What a large company would do versus what actually fits Flo. Do not
   over-engineer for scale we do not have.
4. Your recommendation and reasoning, the risks, and what new information would
   change it.
5. Evidence: say where claims come from. Label "common practice" versus "my
   judgement", and flag anything you could not verify. Never present a guess as
   an industry standard.

### After the owner chooses

Record it in `docs/adr/NNNN-kebab-title.md` (copy `docs/adr/0000-template.md`),
status Accepted, and commit it in the same PR as the implementation. Only then
implement. If the owner asks to revisit a decision, add a new ADR that supersedes
the old one instead of editing history.

## 13. Frontend architecture, performance and leak rules

### 13.1 Separate UI from data and logic

- Components render. They take props and return JSX. No `fetch` or axios calls, no
  business rules, and no data shaping inside components.
- Layers: `features/<feature>/api` (plain typed functions) -> TanStack Query hooks
  (`useTransactions`, mutations) -> feature hooks that combine them with UI logic
  (`useTransactionsPage`: filters synced to the URL, pagination, derived values,
  handlers).
- Pages are thin containers: they call the feature hook and pass plain props to
  presentational components.
- Pure logic (formatting, mapping, selectors) lives in plain functions, not in hooks
  or components.
- Custom hooks are named `useX`, return a small stable shape, never return JSX, and
  are tested with `renderHook`. Presentational components are tested through props.
- Forms: react-hook-form + Zod inside a `useXForm` hook; the component only binds fields.
- Pass plain data and callbacks as props, not whole query objects.
- Zustand only for cross-feature UI or session state, always with selectors
  (`useStore(s => s.x)`), never whole-store subscriptions. Context only for values
  that change rarely; split contexts that mix fast- and slow-changing values.

### 13.2 Performance: measure first, optimize with evidence

Default to straightforward code without memoization. Add an optimization only when at
least one of these is true, and state the evidence (numbers or a React Profiler
observation) in the PR:

- profiling shows a slow or wasteful re-render (typically lists, tables, charts);
- an expensive computation (large arrays, sorting, grouping) runs on every render;
- referential stability is required (effect dependencies, context values, props of a
  memoized child);
- bundle size or load time exceeds the agreed budget.

Tools by situation:
- Colocate state low in the tree before reaching for memoization.
- `useMemo` for expensive derivations. `useCallback` and `React.memo` only together,
  for stable callbacks passed to a memoized child that actually re-renders often.
- `useDeferredValue` or `startTransition` for heavy filtering; debounce search inputs
  (with cleanup).
- Route-level code splitting and dynamic imports for heavy libraries (charts).
- Server-side pagination before virtualization; virtualize only lists that must render
  hundreds of rows.
- Size images and lazy-load them. Avoid inline object or array literals as props to
  memoized children.
- Check whether the React Compiler is enabled in this project (it is an opt-in build
  plugin). If it is, do not hand-write memoization it already does. If it is not, do
  not add it without a decision brief (section 12).
- No "just in case" memoization. Remove memoization that measurements show does nothing.
- Record bundle size and Lighthouse (Core Web Vitals) results in the README; ask me
  before adding a CI budget threshold.

### 13.3 No leaks: effects, timers, listeners, requests

- Every `useEffect` that starts something returns a cleanup that stops it:
  `clearTimeout`, `clearInterval`, `removeEventListener`, `unsubscribe`,
  `socket.close()`, `eventSource.close()`, observer `disconnect()`.
- Keep timer ids in refs or inside the effect closure; never leave a timer without a
  path to clear it. Prefer shared hooks (`useDebouncedValue`, `useTimeout`) that
  handle cleanup in one place.
- Requests: let TanStack Query cancel by passing its `signal` to the HTTP client. For
  ad-hoc requests in effects use `AbortController` and abort in the cleanup. Ignore
  results of stale async work.
- No polling with `setInterval`; use `refetchInterval` where needed.
- Keep React StrictMode on; an effect that breaks when run twice is a bug.
- ESLint: `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` are errors.
  Never silence them without a comment explaining why.
- Module-level singletons (axios interceptors, `refreshQueue`, network listeners) must
  register once, be removable, and never hold references to component instances.
  Unbounded module-level arrays, Maps or queues need a cap or a clearing rule.
- Tests (Vitest) for any hook or component that sets timers, listeners or requests:
  use fake timers and spies and assert, after unmount, that `vi.getTimerCount()` is 0,
  `removeEventListener` was called with the same handler, the abort signal was
  aborted, and no state update or callback runs afterwards.
- Optional e2e leak check: repeat a navigation or open/close journey many times and
  assert heap growth stays under a threshold. Ask before adding a dependency for it.

## 14. Backend resource hygiene

- One shared PrismaClient and one Redis client; both closed in a single graceful
  shutdown handler on SIGTERM and SIGINT. The handler also stops accepting new HTTP
  connections, stops workers, and clears every timer.
- Background `setInterval` and `setTimeout` timers are tracked, cleared on shutdown,
  and `.unref()`'d when they must not keep the process alive.
- Every event listener has a matching removal or a documented lifetime. Never add a
  listener per request. Treat `MaxListenersExceededWarning` as a bug.
- No unbounded in-memory caches or Maps: use Redis with a TTL, or an LRU with a size cap.
- Streams, file handles, and queue workers or connections are closed in `finally` or
  on shutdown.
- Never create Prisma, Redis or HTTP clients per request.
- Tests: `npm run test:handles` (jest `--detectOpenHandles`) must pass with no open
  handles; a test starts and stops the app (and workers) and asserts clean shutdown;
  add a short k6 soak check with a memory readout when features that hold state
  (realtime, queues) land.

## 15. Environments and deployment rules

- Environments: local (Docker), CI (ephemeral service containers), dev (auto-deployed
  from `main`), production (gated). Each has its own database, Redis and secrets.
  Never point dev or local at production data.
- Build once, deploy many: promote the same image or artifact from dev to production.
- Secrets live only in GitHub Environments or the host's secret store: never in the
  repo, logs or PR text. `.env.example` documents variables without values.
- Migrations run as an explicit release step (`prisma migrate deploy`), never on app
  start, and must stay backward-compatible with the previous app version so rollback works.
- Every deploy is followed by a smoke test (health check plus a minimal journey). A
  failed smoke test means rollback.
- Never deploy from a laptop. Do not change hosting, secrets or environment settings
  without a decision brief (section 12) and my approval.
