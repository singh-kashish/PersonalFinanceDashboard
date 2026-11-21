# Flo — Personal Finance Dashboard

[![CI](https://github.com/singh-kashish/PersonalFinanceDashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/singh-kashish/PersonalFinanceDashboard/actions/workflows/ci.yml)

A full-stack personal finance tracker: log income/expenses, browse and filter
transactions, and view spend analytics (category breakdown, monthly trends).

Monorepo with two independently deployable apps:

```
PersonalFinanceDashboard/
├── server/   Node.js + Express + TypeScript API
└── web/      Vite + React + TypeScript SPA
```

## Stack

**Server**

- Express 5, TypeScript
- PostgreSQL via Prisma ORM (6.19.3)
- Redis (analytics caching)
- JWT auth: short-lived access token (Bearer header) + rotating refresh
  token (HttpOnly cookie)
- Zod for request validation
- Jest + Supertest for tests
- Swagger/OpenAPI docs generated from JSDoc route comments

**Web**

- Vite, React 19, TypeScript
- TanStack Router (file-based routes) + TanStack Query (server state)
- Zustand (auth state, global error state)
- Tailwind CSS v4, shadcn/ui, Radix primitives
- Axios (API client, with request/response interceptors)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local Postgres & Redis)

## Local development

### 1. Start local services

Start local PostgreSQL (dev on port 5442, test on 5443) and Redis (port 6380):

```bash
docker compose up -d
# or: npm --prefix server run db:up
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp server/.env.test.example server/.env.test
```

### 3. Deploy migrations & run

```bash
cd server
npm install
npx prisma migrate deploy
npm run dev             # http://localhost:3000, ts-node-dev with auto-restart
```

In a separate terminal, start the web app:

```bash
cd web
npm install
npm run dev             # http://localhost:5173
```

### 4. Running tests

```bash
# Unit tests (pure logic, fast, no external services)
npm --prefix server run test:unit

# Integration tests (requires local test Postgres on 5443 and Redis on 6380)
# Runs silently by default; run test:int:verbose to view logs
npm --prefix server run test:int
npm --prefix server run test:int:verbose

# All tests
npm --prefix server test
```

#### Test conventions

- **Unit tests** (`*.unit.test.ts`): Pure logic and mocked dependencies. Fast, no network, no database.
- **Integration tests** (`*.int.test.ts`): Exercise Express endpoints against the local PostgreSQL test instance (`flo_test` on port 5443) and test Redis (port 6380). Tables are truncated in `beforeEach` between tests.
- **Sequential journey tests** (`*.flow.int.test.ts`): Multi-step integration flows that carry session state across sequential steps; tables are truncated once in `beforeAll`.
- **Database and Redis guards**: Test setup verifies that `DATABASE_URL` points to `localhost`/`127.0.0.1` with a `_test` database name, and `REDIS_URL` points to port `6380`.

## Getting started

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # set DATABASE_URL, REDIS_URL, JWT secrets, etc.
npx prisma migrate deploy
npm run dev             # http://localhost:<port>, ts-node-dev with auto-restart
```

Other server scripts:

| Script                 | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload                        |
| `npm run typecheck`    | Type-check TypeScript (`tsc --noEmit`)            |
| `npm run lint`         | Run ESLint with typescript-eslint & security rules|
| `npm test`             | Run all Jest tests (`--runInBand`)                 |
| `npm run test:unit`    | Run unit tests (`*.unit.test.ts`)                 |
| `npm run test:int`     | Run integration tests silently (`--silent --runInBand`) |
| `npm run test:int:verbose` | Run integration tests with console logs (`--runInBand`) |
| `npm run test:coverage`| Jest with coverage report                         |
| `npm run test:handles` | Jest detecting open handles                       |
| `npm run test:watch`   | Jest in watch mode                                |
| `npm run build`        | Compile TypeScript to `dist/`                     |
| `npm start`            | Run compiled server (`dist/server.js`)            |
| `npm run db:up`        | Start local Docker services                       |
| `npm run db:down`      | Stop local Docker services                        |
| `npm run db:test:migrate` | Deploy migrations against the test database   |

API docs are served via `swagger-ui-express`; route JSDoc lives alongside
each router (`src/routes/*.routes.ts`).

### 2. Web

```bash
cd web
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev             # http://localhost:5173
```

| Script              | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Vite dev server                      |
| `npm run typecheck` | Type-check TypeScript (`tsc -b --noEmit`)|
| `npm run build`     | Type-check + production build        |
| `npm run lint`      | ESLint                               |
| `npm run preview`   | Preview the production build locally |

## API surface

All routes are prefixed with the server's base path (see `VITE_API_URL`).

**Auth** (`/auth`)
| Method | Path | Auth required | Notes |
|---|---|---|---|
| POST | `/auth/signup` | No | Sets refresh-token cookie, returns access token |
| POST | `/auth/login` | No | Sets refresh-token cookie, returns access token |
| GET | `/auth/me` | Bearer | Current user |
| POST | `/auth/refresh` | Refresh cookie | Rotates refresh token, returns new access token |
| POST | `/auth/logout` | Bearer | Revokes current refresh token |
| POST | `/auth/logout-all` | Bearer | Revokes all of the user's refresh tokens |

**Transactions** (`/transactions`, all Bearer-protected)
| Method | Path |
|---|---|
| POST | `/transactions` |
| GET | `/transactions` |
| GET | `/transactions/:id` |
| PATCH | `/transactions/:id` |
| DELETE | `/transactions/:id` |

**Analytics** (`/analytics`)
| Method | Path |
|---|---|
| GET | `/analytics/summary` |
| GET | `/analytics/categories` |
| GET | `/analytics/monthly` |
| GET | `/analytics/category-trends` |

**Health**
| Method | Path |
|---|---|
| GET | `/health` |

## Further reading

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the data model, the auth
design (token rotation, refresh flow, bootstrap state machine), the
frontend error/circuit-breaker layer, and caching strategy.
