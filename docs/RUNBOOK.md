# Flo Runbook: from Docker and Postgres to done

Repo: `~/Documents/work/PersonalFinanceDashboard`. Rough timeline: M1 about 1 to 1.5 weeks,
M2 about 1.5 weeks, M3 about 1 week, M4 about 2 weeks (evenings and weekends).

## 0. One-time machine setup

1. Docker Desktop running: `docker version` must show both Client and Server.
2. GitHub CLI: `brew install gh && gh auth login`, then `gh auth status`.
3. Free ports: `lsof -i :5442 -i :5443 -i :6380` should print nothing. (Your Mac already
   has a Postgres on 5432. Leave it alone; Flo uses the ports above.)
4. `node -v` shows an LTS version, `git --version` works.

## 1. Repo baseline and GitHub workflow

1. `git status && git branch -vv && git log --oneline -5`. Know which branch holds the work
   (probably `frontend`, which has the inspection commit).
2. Baseline into main: `git push -u origin HEAD`, `gh pr create --base main`, merge it
   (plain merge, this once, to keep history).
3. `git switch main && git pull && git switch -c chore/git-workflow`.
4. Copy in: `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/{task,bug,decision}.yml`,
   `scripts/gh-bootstrap.sh` (then `chmod +x`), `PROMPTS.md` as `docs/PROMPTS.md`,
   `docs/adr/0000-template.md`.
5. In `AGENTS.md`: replace section 7 with `GIT_WORKFLOW.md`; append the Testing policy
   (PROMPTS.md section A) as section 10 and `AGENTS-ADDENDUM.md` as sections 11 and 12.
6. Commit (`chore: add GitHub workflow, templates, ADRs`), push, PR, squash-merge.
7. `./scripts/gh-bootstrap.sh`, then `gh issue list` should show P1 to P15.

## 2. Postgres, Redis and the test database in Docker

Issue P1 has the agent build this. This section is what "correct" looks like, so you can
review the agent's work or set it up by hand.

`docker-compose.yml` (repo root):

```yaml
services:
  postgres-dev:
    image: postgres:16-alpine
    container_name: flo-postgres-dev
    ports:
      - "5442:5432"
    environment:
      POSTGRES_USER: flo
      POSTGRES_PASSWORD: flo_local
      POSTGRES_DB: flo_dev
    volumes:
      - pgdata-dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flo -d flo_dev"]
      interval: 5s
      timeout: 3s
      retries: 5

  postgres-test:
    image: postgres:16-alpine
    container_name: flo-postgres-test
    ports:
      - "5443:5432"
    environment:
      POSTGRES_USER: flo
      POSTGRES_PASSWORD: flo_local
      POSTGRES_DB: flo_test
    tmpfs:
      - /var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flo -d flo_test"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: flo-redis
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata-dev:
```

`server/.env` (never commit; keep Neon credentials out of it):

```
DATABASE_URL="postgresql://flo:flo_local@localhost:5442/flo_dev"
REDIS_URL="redis://localhost:6380"
```

`server/.env.test` (never commit):

```
DATABASE_URL="postgresql://flo:flo_local@localhost:5443/flo_test"
REDIS_URL="redis://localhost:6380"
```

Commands:

```bash
docker compose up -d                  # start everything
docker compose ps                     # wait until all show "healthy"
cd server
npx prisma migrate deploy             # apply migrations to the dev DB
docker compose exec postgres-dev psql -U flo -d flo_dev -c '\dt'   # tables exist?
npm run test                          # should hit ONLY the test DB (port 5443)
docker compose down                   # stop, keep dev data
docker compose down -v                # stop and WIPE dev data (local only)
```

Neon stays as your production database later. Its URL lives only in the host's secret
settings, never in a local `.env` the tests can load.

Checkpoint: containers healthy, migrations applied, tests run against `flo_test`, and the
guard test proves a Neon-style URL is rejected.

## 3. The loop for every issue (repeat for each of P1 to P15)

1. `gh issue list --milestone "M1 Foundation"`: pick the next unblocked issue.
2. New agent session. Paste the shared preamble (PROMPTS.md section B), set `#<N>`.
3. Read the agent's plan. Correct it before approving. Push back on scope creep.
4. The agent works test-first and opens a PR. You review the diff, line by line for money,
   auth, migrations and anything tenancy-related. Ask it to explain anything you could not
   explain in an interview. Also check: `git log --oneline origin/main..HEAD` shows small,
   atomic, conventional commits; any memoization or optimization has a stated measurement;
   every effect with a timer, listener or request has cleanup and a test.
5. CI green, then merge: `gh pr merge <N> --rebase` (every atomic commit lands on main;
   use `--squash` only for a messy branch). The branch auto-deletes.
6. `git switch main && git pull --ff-only`, then the next issue.

If a session goes wrong: `git switch main && git branch -D <branch>` and start again.

## 4. Milestone M1: Foundation (P1 to P8)

Order: P1 infra and test harness, P2 CI, then P3 bug fixes, P4 money module, P5 Decimal
migration, P6 analytics refactor, P7 security suite, P8 web tooling. (P3, P4, P7, P8 only
need P1, so they can be reordered if one stalls.)

After P2 is merged and CI has run once, protect main:
`./scripts/gh-bootstrap.sh --protect server,web` (use your real CI job names).

Done when: CI is green on main, web build and lint pass, server unit and integration suites
pass against the Docker test DB, money module has property tests, security suite exists.

## 5. Milestone M2: Transactions (P9 to P12), with the design workflow

For each screen (transactions list, add/edit dialog, later dashboard, analytics, settings):

1. Generate the screen in Google's design tool; take it through Figma as you do now.
2. Export the frames to `docs/design/<screen>/` (`reference.png`, plus `mobile.png`,
   `dark.png` if they exist; Figma link in `figma.txt`; any intent in `notes.md`).
3. Create a task issue labeled `area: design`. Run prompt D1 (fit report, no code).
4. Read `FIT.md`. Under "Decisions" write which option you choose for each non-direct item.
   Merge that PR.
5. Run prompt D2 (implementation, TDD: unit, component with axe, integration with MSW,
   Playwright journey and screenshots).
6. Review the PR plus `REVIEW.md` (built versus reference at 375/768/1280). Merge.

Order: P9 data layer, then D1/D2 for the transactions page, D1/D2 for the add/edit/delete
dialogs, then P12 Playwright journeys (cross-screen e2e).

Done when: you can sign up, add, filter, edit and delete transactions in the browser, e2e
passes in CI, and the app is deployed or deployable.

## 6. Decisions along the way

Whenever a choice appears (the list is at the end of PROMPTS.md): run prompt R, read the
brief, ask follow-up questions, choose, and make the agent record an ADR in the feature PR.
Do not let the agent pick for you, and do not pick something you could not defend in an
interview.

## 7. Milestone M3: Polish and deploy (P13, P16, P17, P14)

P13 is dashboard, analytics and settings, each through D1 and D2. Then P16: a decision brief
(prompt R) for hosting and environments; you choose and the ADR is recorded. Then P17: the
CI/CD pipelines (dev auto-deploys from main, production is gated and promotes the same build,
migrations run as a release step, smoke tests after every deploy, rollback documented in
docs/DEPLOYMENT.md). P14 last: README, architecture docs, screenshots, performance numbers.

Done when: a public URL works end to end, a merge to main reaches dev automatically, a tagged
release reaches production after approval, README is interview-ready, and Architecture-Design.md
matches the code.

## 8. Milestone M4: Workspaces (P15)

Start with prompt R on the tenancy approach. Then tests first: the isolation suite (user A
can never reach workspace B across every route, analytics and cache keys included), the role
matrix, invitations, and an e2e invite flow. Then Redis queue work (CSV import, recurring
transactions), realtime updates, the AI assistant, and Stripe, each as its own issues
created with the Task template, in that order.

## 9. Job search runs in parallel (do not wait for M4)

- Now: apply daily with your current resume. Prioritize roles posted in the last three weeks
  asking for up to about 4 years; use referrals for stretch roles.
- After M1: add resume bullets for the test pyramid, CI, Docker, and money correctness.
- After M2 or M3: add the live URL and repo link, and put Flo first on the resume.
- After M4: add multi-tenancy, RBAC and realtime bullets and update your keywords.
- Write one short post about a decision you made (for example the money model or tenancy
  choice), linking its ADR.

## 10. Troubleshooting

- `port is already allocated`: something else holds the port. `lsof -i :<port>`, then change
  the host port in the compose file and in the `.env` files.
- `Cannot connect to the Docker daemon`: open Docker Desktop and wait for it to finish starting.
- Prisma cannot connect: wrong port in `DATABASE_URL`, or the container is not yet healthy
  (`docker compose ps`).
- Tests refuse to start: the test-DB guard is doing its job; the URL must be localhost and the
  database name must end in `_test`.
- Agent edited things outside the issue: reject the PR, `git branch -D`, restart with a tighter
  prompt and a reminder of the scope rules.
