# Flo — Personal Finance Dashboard

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
- PostgreSQL instance
- Redis instance

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

| Script               | Purpose                                |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Dev server with hot reload             |
| `npm test`           | Run Jest test suite (`--runInBand`)    |
| `npm run test:watch` | Jest in watch mode                     |
| `npm run build`      | Compile TypeScript to `dist/`          |
| `npm start`          | Run compiled server (`dist/server.js`) |

API docs are served via `swagger-ui-express`; route JSDoc lives alongside
each router (`src/routes/*.routes.ts`).

### 2. Web

```bash
cd web
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev             # http://localhost:5173
```

| Script            | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Vite dev server                      |
| `npm run build`   | Type-check + production build        |
| `npm run lint`    | ESLint                               |
| `npm run preview` | Preview the production build locally |

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
