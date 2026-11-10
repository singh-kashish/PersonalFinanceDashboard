# Flo — Codebase Inspection Report

Conducted on: 2026-11-10  
Repository: Flo (Personal Finance Dashboard)  
Branch: `frontend`

---

## 1. What Exists

### 1.1 Architecture & Monorepo Structure
The repository is structured as a two-package monorepo:
- `server/`: Node.js Express 5 API written in TypeScript, using Prisma ORM (v6.19.3) against PostgreSQL (Neon), Redis (v6.0.0) for analytics caching, and Jest (v30.4.2) / Supertest for testing.
- `web/`: Vite SPA built with React 19, TypeScript, TanStack Router (file-based routing), TanStack Query (v5), Zustand (v5), Tailwind CSS v4, and Radix UI / shadcn/ui components.

### 1.2 Database & Schema
- **Models in `server/prisma/schema.prisma`**:
  - `User`: `id` (Int PK), `email` (unique String), `name` (optional String), `password` (bcrypt hash), `createdAt`, `updatedAt`.
  - `Transaction`: `id` (Int PK), `amount` (unbounded Decimal), `type` (`INCOME` | `EXPENSE` enum), `category` (String), `description` (optional String), `date` (DateTime), `userId` (Int FK -> User). Indexes on `[userId]`, `[userId, date]`, `[userId, type]`, `[category]`, `[userId, category]`.
  - `RefreshToken`: `id` (Int PK), `token` (unique String SHA-256 hash), `userId` (Int FK -> User), `expiresAt`, `createdAt`. Index on `[userId]`.
- **Migrations in `server/prisma/migrations`**:
  - `20260508145422_init`: User table creation.
  - `20260509133113_add_transactions`: Transaction table and TransactionType enum.
  - `20260531160355_add_refresh_tokens`: RefreshToken table and transaction composite indexes.
  - **Schema Drift**: No drift between `schema.prisma` and the migration SQL files.

### 1.3 Server Implementation
- **Routes & Controllers**:
  - Auth (`/auth`): `/signup`, `/login`, `/me`, `/refresh`, `/logout`, `/logout-all`.
  - Transactions (`/transactions`): `POST /`, `GET /` (with filters & pagination), `GET /:id`, `PATCH /:id`, `DELETE /:id`.
  - Analytics (`/analytics`): `GET /summary`, `GET /categories`, `GET /monthly`, `GET /category-trends`.
  - Health check (`/health`): `GET /`.
  - API documentation: Swagger UI mounted at `/api-docs`.
- **Infrastructure**:
  - `infra/prisma.ts`: Exporting shared `PrismaClient` singleton.
  - `infra/redis.ts`: Redis connection lifecycle with `getRedis()`, `initRedis()`, and `shutdownRedis()`.
- **Caching**:
  - Versioned per-user Redis caching for analytics (`analytics:v{version}:user:{id}:{shape}`).
  - Bumping the user version invalidates all cached queries in O(1) without keyspace scans.
- **Middleware**:
  - `authMiddleware`: Bearer token validation and `req.auth` attachment.
  - `validate`: Zod-based request validation middleware for `body`, `query`, and `params`.
  - `rateLimit`: Global limiter (200 req / 15 min) and Auth limiter (20 req / 15 min).
  - `requestId`: UUID generation and `x-request-id` response header.
  - `logger`: Morgan logger capturing method, URL, status, response time, and request ID.
  - `errorMiddleware`: Formats `AppError` and `ZodError`.

### 1.4 Web Implementation
- **Routing & Shell**:
  - TanStack file-based router with route tree generation (`web/src/routeTree.gen.ts`).
  - Routes present: `/` (`index.tsx`), `/dashboard` (`dashboard.tsx`), `/analytics` (`analytics.tsx`), `/settings` (`settings.tsx`), `__root.tsx`.
  - Layout components: `AsideNav` (desktop sidebar and mobile bottom bar), `Header`, `AppShell`, `ErrorLayout`.
- **State Management & Auth**:
  - `useAuthStore` (Zustand): Manages user state, `accessToken`, bootstrapping flag, and login/logout actions.
  - `apiClient` (Axios): Attaches Bearer token, interceptor for single-flight token refresh with queuing (`refreshQueue`), and offline/server-unreachable error handling.
  - `useErrorStore` (Zustand): Circuit breaker handling `network-offline` and `server-unreachable` states.
- **Data Fetching**:
  - TanStack Query hooks in `features/analytics/hooks/`: `useAnalyticsSummary`, `useCategoryAnalytics`, `useMonthlyAnalytics`, `useCategoryTrends`.
- **Design & UI Primitives**:
  - Tailwind CSS v4 with dark mode theming (`next-themes`).
  - Radix UI primitives and shadcn UI components (`button`, `card`, `dropdown-menu`, `skeleton`, `sonner`, `chart`).

### 1.5 Package Scripts & Key Dependencies
- **Server (`server/package.json`)**:
  - Real scripts: `dev`, `test`, `test:watch`, `build`, `start`.
  - Missing scripts: `lint`, `typecheck`.
  - Key dependencies: `express@^5.2.1`, `@prisma/client@^6.19.3`, `prisma@^6.19.3`, `redis@^6.0.0`, `zod@^4.4.3`, `jsonwebtoken@^9.0.3`, `bcryptjs@^3.0.3`, `helmet@^8.2.0`, `cors@^2.8.6`, `cookie-parser@^1.4.7`, `express-rate-limit@^8.5.2`, `jest@^30.4.2`, `supertest@^7.2.2`, `typescript@^6.0.3`.
- **Web (`web/package.json`)**:
  - Real scripts: `dev`, `build`, `lint`, `preview`.
  - Missing scripts: `test`, `typecheck`.
  - Key dependencies: `react@^19.2.5`, `react-dom@^19.2.5`, `@tanstack/react-router@^1.170.17`, `@tanstack/react-query@^5.101.2`, `zustand@^5.0.14`, `tailwindcss@^4.3.2`, `axios@^1.18.1`, `recharts@^3.8.0`, `zod@^4.4.3`, `react-hook-form@^7.83.0`, `eslint@^10.2.1`, `typescript@~6.0.2`, `vite@^8.0.10`.

---

## 2. What Is Broken or Incomplete

### 2.1 Discrepancies with Documentation
1. **Documentation Link**: `README.md` references `ARCHITECTURE.md` (lines 120-122), but the actual file is `Architecture-Design.md`.
2. **Money Claims vs Implementation**: `Architecture-Design.md` claims:
   > "Money is stored as Prisma Decimal, converted at the API boundary — never handled as floating point in aggregate calculations."  
   In reality, `analytics.service.ts` converts Prisma Decimals to JavaScript floating-point numbers immediately via `toNumber()` and performs all sums, differences, and percentages using native JS arithmetic.
3. **Transactions UI**: `README.md` advertises logging and browsing transactions, but the frontend has no transactions page or table at all.

### 2.2 Broken Code & Bugs
1. **Controller Bug in `logoutAllController`**:
   In `server/src/controllers/auth.controller.ts` (lines 149–161):
   If `req.cookies["refreshToken"]` is missing or undefined, the handler fails to send any response or call `next()`. The client HTTP request hangs until it times out. Furthermore, if `deleted.count <= 0`, it throws `new AppError("Server issue", 400)` instead of gracefully concluding the logout.
2. **Missing Return Value in `updateTransactionService`**:
   In `server/src/services/transaction.service.ts` (lines 125–155), `updateTransactionService` performs `prisma.transaction.updateMany` but returns `undefined`. The controller `updateTransaction` expects the updated row and calls `sendSuccess(res, 200, updatedTransaction)`, sending `null`/`undefined` data to the client.
3. **Promise / Cache Race in `createTransactionService`**:
   In `server/src/services/transaction.service.ts` (lines 20–43), `prisma.transaction.create(...)` is assigned to `const result` without `await`. While returning `result` resolves the promise for the caller, `invalidateAnalyticsForUser(userId)` is kicked off synchronously before the database write has actually settled or succeeded.
4. **Broken Take Parameter in `getRecentTransactions`**:
   In `server/src/utils/analytics.utils.ts` (line 46):
   `const take = Math.min(Math.max(limit, 50), 50);`
   Regardless of the `limit` argument provided (whether 10 or 100), `take` always evaluates to `50`.
5. **Layering Violation in `analytics.utils.ts`**:
   `getRecentTransactions` directly imports and calls `prisma.transaction.findMany` inside a utility file (`analytics.utils.ts`), violating the architectural rule that only services access Prisma.
6. **Orphan Empty Stub Files**:
   - `server/src/events/eventBus.js` (empty, 0 bytes)
   - `server/src/config/db.js` (empty, 0 bytes)
   - `server/src/utils/csvParser.js` (empty, 0 bytes)
   - `web/src/features/transactions/transactions.api.ts` (empty, 0 bytes)
   - `web/src/features/transactions/transactions.types.ts` (empty, 0 bytes)
   - `web/src/features/transactions/hooks/` (empty directory)

### 2.3 Broken Build & Lint in Web
1. **TypeScript Build Fails (`npm --prefix web run build`)**:
   Produces 5 TypeScript errors:
   - `web/src/features/auth/components/AuthShell.tsx:8:1`: TS6133 'Dashboard' declared but never read.
   - `web/src/features/dashboard/components/CashFlowChart.tsx:44:31`: TS6133 'transactions' declared but never read.
   - `web/src/features/dashboard/components/CashFlowChart.tsx:44:32`: TS2339 Property 'transactions' does not exist on type '[] | Transaction[]'.
   - `web/src/features/dashboard/components/Dashboard.tsx:22:28`: TS2322 Type mismatch passing `recentTransactions` to `CashFlowChart`.
   - `web/src/lib/apiClient.ts:7:26`: TS6133 'clearAccess' declared but never read.
2. **ESLint Fails (`npm --prefix web run lint`)**:
   Produces 17 errors:
   - 11 instances of `@typescript-eslint/no-explicit-any` in `NavLink.tsx`, `useAuthStore.ts`, `apiClient.ts`, and `networkStatus.ts`.
   - 3 unused variables (`@typescript-eslint/no-unused-vars`).
   - 3 Fast refresh warnings (`react-refresh/only-export-components`) in `button.tsx`, `routes/index.tsx`, and `routes/settings.tsx`.

### 2.4 Test Suite Failures in Server (`npm --prefix server test`)
1. **Jest Polluted by `dist/`**: Running `tsc` outputs compiled JavaScript into `dist/`. Jest's default test match picks up both `src/tests/**/*.ts` and `dist/src/tests/**/*.js`. The compiled test files in `dist` fail immediately with `Cannot find module '../generated/prisma' from 'dist/src/infra/prisma.js'`.
2. **Remote Neon Database Dependency**: The integration tests (`auth.flow.test.ts`, `auth.integration.test.ts`) connect to the remote Neon PostgreSQL instance rather than a local/in-memory or mocked test database. In isolated/sandboxed or offline environments, network requests fail.

### 2.5 Incomplete Features in Frontend
1. **Missing Transactions UI**:
   - `web/src/routes/` has no `transactions.tsx` route, causing the navigation link to 404.
   - `web/src/features/transactions/components/Dashboard.tsx` is an empty 6-line stub rendering `<main>Dashboard</main>`.
   - There are no components or hooks to create, list, filter, paginate, edit, or delete transactions.
2. **Incomplete Analytics UI**:
   - `web/src/routes/analytics.tsx` points to `AnalyticsPage.tsx`, which is a 6-line stub rendering `<main>Analytics</main>`. The analytics API hooks are written but unused on the page.
3. **Incomplete Settings UI**:
   - `web/src/routes/settings.tsx` renders `<div>Hello "/settings"!</div>`.
4. **Mocked Dashboard CashFlowChart**:
   - `CashFlowChart.tsx` is an unadapted shadcn template displaying hardcoded "desktop vs mobile visitors" rather than user financial cash flow or transactions.

---

## 3. Risks (Security, Money, Tenancy)

### 3.1 Security Risks
1. **Missing Rate Limiting on Signup**:
   `server/src/routes/auth.routes.ts` applies `authLimiter` to `/auth/login` and `/auth/refresh`, but NOT to `/auth/signup`. An attacker can flood user creation up to the global limit (200 requests / 15 min).
2. **Information Leak in Production Error Responses**:
   In `server/src/middlewares/error.middleware.ts` (lines 46–56):
   When an unhandled `Error` occurs, `statusCode` is set to 500 and `message` is set directly to `err.message`. This leaks internal database error messages, Prisma details, or server stack specifics to clients in production.
3. **Direct LocalStorage Access Token Storage**:
   `web/src/features/auth/AuthHelpers.ts` stores JWT access tokens in browser `localStorage`, making them vulnerable to token theft via Cross-Site Scripting (XSS).
4. **Direct Process Environment Access for Cookie Security**:
   `server/src/utils/CookieOptions.ts` checks `process.env.NODE_ENV === 'production'` directly rather than using validated `env` from `config/env.ts` (where `NODE_ENV` is not defined in the Zod schema).
5. **No Password Complexity Rules**:
   `server/src/validators/auth.validator.ts` requires only `password: z.string().min(6)`. There are no checks for character diversity or complexity.

### 3.2 Money Risks
1. **Unbounded Decimal in PostgreSQL**:
   `server/prisma/schema.prisma` declares `amount Decimal`, which Prisma maps to PostgreSQL `DECIMAL(65,30)` instead of a bounded, standard financial type like `@db.Decimal(19, 2)`.
2. **No ISO 4217 Currency Dimension**:
   Neither `Transaction` nor analytics queries support currency. All transactions are treated as uniform numeric values without currency attribution.
3. **Pervasive Floating-Point Arithmetic**:
   - `server/src/utils/money.ts` does not exist.
   - `server/src/utils/decimal.ts` converts Prisma Decimals into JavaScript IEEE 754 floats using `value.toNumber()`.
   - `summaryService`: `balance = totalIncome - totalExpense` (float math).
   - `categoryService`: `totalCategoryAmount = categories.reduce(...)` (float accumulator), and percentages use `Number(((totalAmount / totalCategoryAmount) * 100).toFixed(2))`.
   - `monthlyService`: `entry.income += amount`, `balance = value.income - value.expense` (float accumulation and subtraction).
4. **Input Coercion to Number**:
   `server/src/validators/transaction.validator.ts` coerces input amounts into JavaScript numbers via `z.coerce.number().positive()`, immediately losing arbitrary precision before reaching the service or database.
5. **API Response Float Serialization**:
   Analytics endpoints return amounts as numbers (e.g. `450.75` as float) rather than strings (`"450.75"`), violating AGENTS.md Money Rule 3.
6. **Frontend Formatting Without `Intl.NumberFormat`**:
   `web/src/features/dashboard/components/CardTemplate.tsx` formats currency with `${amount}` in a template string instead of `Intl.NumberFormat`.

### 3.3 Tenancy Risks
1. **Zero Tenant / Workspace Isolation**:
   Currently, the application is strictly single-tenant. No `Workspace`, `WorkspaceMember`, or `workspaceId` exists on any database model.
2. **Absence of Centralized RBAC**:
   There is no authorization helper (`can(member, action, resource)`) in the service layer.
3. **Data Scoping Model**:
   All records are currently scoped solely by `userId`. Growing into a workspace model will require adding `workspaceId`, migrating existing transactions to personal or default workspaces, and ensuring no query reads or writes data without workspace-level scoping.

---

## 4. Missing Tests

1. **Analytics Service Tests**:
   - `server/src/services/analytics.service.ts` has zero unit or integration tests.
   - No tests exist verifying math precision, zero transaction edge cases, date boundary filtering, or empty category lists.
2. **Analytics Redis Caching Tests**:
   - Zero tests for `analyticsCache.ts`, `analyticsCacheKey.ts`, `analyticsCacheVersion.ts`, or cache invalidation on transaction create/update/delete.
3. **Money Utility Tests**:
   - No tests for money precision, rounding modes, or currency handling (since `money.ts` does not yet exist).
4. **Transaction Validation & Failure Path Tests**:
   - While `transaction.test.ts` covers basic CRUD, tests for invalid query parameters, malformed dates, negative amounts, and unauthorized access across users are missing.
5. **Web Package Tests**:
   - The web app has no test runner (no Vitest or Jest), no configuration, and zero tests.
   - Auth store bootstrap logic (`bootstrapAuthFlow`), the offline/server-unreachable circuit breaker, and the single-flight refresh queue (`refreshQueue`) are completely untested.

---

## 5. Suggested Order of Work

To transition Flo into a robust, interview-defensible foundation before expanding into Workspaces, Queues, Realtime, and AI, the recommended execution order is:

### Phase 1: Stability & Cleanliness (Bug Fixes & Tooling)
1. Configure Jest to ignore `<rootDir>/dist/` and configure proper typecheck/lint scripts for both packages.
2. Fix the 5 TypeScript build errors and 17 ESLint errors in `web/` (remove `any`, eliminate unused imports, fix component exports).
3. Fix backend bugs:
   - Fix `logoutAllController` hanging response when cookie is absent.
   - Return updated transaction in `updateTransactionService`.
   - `await` `prisma.transaction.create` before invalidating cache in `createTransactionService`.
   - Fix `take` calculation and remove direct Prisma calls from `analytics.utils.ts`.
   - Sanitize 500 error messages in `error.middleware.ts` for non-development environments.
   - Delete empty orphan stub files (`eventBus.js`, `db.js`, `csvParser.js`).

### Phase 2: Money Discipline & Security Basics
1. Implement `server/src/utils/money.ts` using `Prisma.Decimal` / `decimal.js` for all additions, subtractions, and rounding. Replace `decimal.ts`.
2. Migrate database schema for `Transaction.amount` from unbounded `Decimal` to `@db.Decimal(19, 2)`.
3. Update `transaction.validator.ts` to validate money amounts as positive decimal strings or precise Decimals rather than converting to JS numbers.
4. Refactor `analytics.service.ts` to perform all aggregations using `money.ts` and return string-serialized money values (`"450.75"`) in API responses.
5. Update frontend to consume decimal strings and format them using `Intl.NumberFormat`.
6. Add `authLimiter` to `/auth/signup`. Add `NODE_ENV` to `server/src/config/env.ts`.

### Phase 3: Complete Core Frontend UI
1. Build the missing Transactions UI:
   - Create `/transactions` route (`web/src/routes/transactions.tsx`).
   - Implement `transactions.api.ts` and `transactions.types.ts`.
   - Build transactions table with pagination, date range filtering, search, and type/category filters.
   - Build Add/Edit Transaction modal dialogs and Delete confirmation.
2. Replace mock `CashFlowChart.tsx` with a real cash flow chart connected to `useMonthlyAnalytics` or `useCategoryTrends`.
3. Complete the Analytics page (`AnalyticsPage.tsx`) using existing analytics query hooks.
4. Complete the Settings page.

### Phase 4: Multi-Tenancy (Workspaces, RBAC, Isolation)
1. Add `Workspace` and `WorkspaceMember` (OWNER, ADMIN, MEMBER, VIEWER) to `schema.prisma`.
2. Add non-null `workspaceId` to tenant tables.
3. Implement centralized `can(member, action, resource)` authorization helper in the service layer.
4. Write tenant isolation integration tests proving User A cannot read or write Workspace B data.
