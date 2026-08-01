# Architecture & Design — Flo (Personal Finance Dashboard)

## 1. High-level shape

```
┌─────────────┐        HTTPS (Bearer + cookie)        ┌──────────────┐
│   web/      │ ─────────────────────────────────────▶│   server/    │
│  React SPA  │◀───────────────────────────────────────│  Express API │
└─────────────┘                                        └──────┬───────┘
                                                                │
                                                   ┌────────────┼────────────┐
                                                   ▼                         ▼
                                            ┌─────────────┐          ┌─────────────┐
                                            │ PostgreSQL  │          │    Redis    │
                                            │  (Prisma)   │          │ (analytics  │
                                            │             │          │  cache)     │
                                            └─────────────┘          └─────────────┘
```

- The web app never talks to Postgres/Redis directly — everything goes
  through the Express API.
- Access tokens are carried as a `Bearer` header, attached client-side per
  request. Refresh tokens live only in an HttpOnly cookie, never touched by
  JS.

## 2. Data model

```
User (1) ──────< Transaction (N)
User (1) ──────< RefreshToken (N)
```

- `User`: `id`, `email` (unique), `name?`, `password` (bcrypt hash).
- `Transaction`: `amount` (Decimal), `type` (`INCOME` | `EXPENSE`),
  `category`, `description?`, `date`. Indexed on `userId`, `userId+date`,
  `userId+type`, `category`, `userId+category` — matching the query
  patterns analytics and transaction listing actually use (filter by user
  first, then by date range / type / category).
- `RefreshToken`: stores a **hash** of the refresh token (never the raw
  value), `expiresAt`, `userId`. One row per active session/device.

Money is stored as Prisma `Decimal`, converted at the API boundary — never
handled as floating point in aggregate calculations.

## 3. Auth design

### 3.1 Token model

Three-state system per session:

1. **Logged out** — no access token, no valid refresh token.
2. **Logged in, access token valid** — normal request path.
3. **Logged in, access token expired, refresh token valid** — the access
   token is short-lived by design; the refresh token (rotating, HttpOnly
   cookie) is used to mint a new one transparently.

### 3.2 Refresh token rotation

`refreshTokenTransaction` (server) does the rotation atomically inside a
single Prisma `$transaction`:

1. Look up the presented token by hash. Missing → `401 Invalid session`.
   Expired → `401 Session expired`.
2. Delete that token row. If the delete affected 0 rows, another concurrent
   request already consumed it — reject as `401 Invalid Session`. This is
   what makes rotation **single-use**: a stolen, already-used refresh token
   is worthless even if replayed within the same millisecond.
3. Opportunistically sweep other expired tokens for the user.
4. Cap the user at `MAX_REFRESH_TOKENS` sessions, evicting the oldest.
5. Issue a new access + refresh token pair, insert the new refresh token
   (hashed) into the same transaction.

Because steps 2–5 share one transaction, there's no window where a token is
deleted but the replacement isn't committed yet — a crash mid-rotation
can't leave a session that's neither the old nor the new token.

### 3.3 Client-side bootstrap state machine

On every page load, `bootstrapAuthFlow()` (Zustand store, `web/src/features/auth/store/useAuthStore.ts`)
has to resolve which of the three states the user is actually in, **and**
handle a fourth axis orthogonal to auth entirely: _is the server even
reachable right now_.

```
                    ┌───────────────────┐
                    │  no access token  │──▶ logged out, done
                    └───────────────────┘
                              │ token present
                              ▼
                    ┌───────────────────┐
                    │  GET /auth/me     │
                    └─────────┬─────────┘
              response        │        no response
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                   ▼
      200 → logged in    401 → try refresh   network error →
      (done)                  │               leave token/user
                               ▼               alone, stop
                    ┌────────────────────┐     spinning, flag
                    │ POST /auth/refresh │     'server-unreachable'
                    └─────────┬──────────┘
              response        │        no response
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                   ▼
      200 → store new    401 → hard logout   network error →
      token, GET /me     (refresh token is    same as above
      again, done        invalid/expired)
```

**The rule that makes this safe:** only a response that the server actually
sent (any HTTP status) can end a session. The complete absence of a
response — offline, DNS failure, timeout, CORS, the process being down —
is never treated as "the session is invalid." It's treated as "unknown,
try again later," and the previously-known auth state is preserved.

This distinction is why the flow checks `!err.response` (network error) as
a completely separate branch from `err.response.status === 401`
(explicit rejection), rather than lumping "the request failed" into one
case.

### 3.4 Request-time refresh (already-running session)

`web/src/lib/apiClient.ts` is the axios instance used for all authenticated
calls after bootstrap. Its response interceptor:

- On a genuine network error (no `error.response`): reports
  `server-unreachable` and rejects immediately — it does **not** enter the
  401/refresh path, and does not touch the stored token.
- On `401` from any endpoint other than `/auth/refresh` itself: triggers a
  **single-flight** refresh. If a refresh is already in progress, the
  failed request is queued (`refreshQueue`) rather than firing a second
  concurrent refresh; once the in-flight refresh resolves, every queued
  request is replayed with the new token (or rejected together, if refresh
  failed).
- Only clears the stored access token when the refresh call itself comes
  back with an explicit non-2xx response. A network error while refreshing
  leaves the token in place.

## 4. Frontend error / "circuit breaker" layer

Three concerns are deliberately kept separate rather than merged into one
error handler:

| Concern                                                | Owner                                                               | Trigger                      |
| ------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------- |
| Browser has no connectivity                            | `RootComponent` (`navigator.onLine` + `online`/`offline` listeners) | Sets `network-offline`       |
| Server unreachable (online, but no response came back) | `apiClient` interceptor + bootstrap's network-error branches        | Sets `server-unreachable`    |
| Auth state (logged in / out / refreshing)              | `useAuthStore`                                                      | Independent of the above two |

`useErrorStore` (Zustand) holds `globalErrorType: 'none' | 'network-offline'
| 'server-unreachable'`. `ErrorLayout` wraps the whole app (above
`AuthShell`) and renders a full-screen state for the first two; a
successful response anywhere in the app automatically clears
`server-unreachable`, and the `online` event automatically clears
`network-offline` — neither requires the user to do anything, though
`server-unreachable` also offers a manual "Retry" (`window.location.reload()`).

**Per-feature panels** (analytics cards, transaction lists) additionally
read `globalErrorType` directly for a localized "can't reach the server
right now" message instead of a spinner or a generic error card, and set
their TanStack Query `retry` option to skip automatic retries on network
errors (`!error.response`) while still retrying ordinary 5xx responses a
couple of times. This means a server outage degrades the UI panel-by-panel
without ever forcing a logout or a full-page teardown of app state the user
was mid-interaction with.

**Why these stay separate:** collapsing "can't reach the server" and "the
server rejected you" into one code path is exactly what previously caused
losing connectivity to log the user out (see fix notes below) — the two
failure modes look identical at the HTTP-status layer (both are "the
request failed") but demand opposite responses (preserve session vs. clear
session).

## 5. Caching (analytics)

Analytics endpoints (`summary`, `categories`, `monthly`, `category-trends`)
are backed by Redis (`src/utils/redis/analyticsCache.ts`,
`analyticsCacheKey.ts`, `analyticsCacheVersion.ts`, `baseCache.ts`):

- Cache keys are scoped per user and per query shape.
- A version counter per user is bumped on transaction writes
  (create/update/delete), which invalidates all cached analytics for that
  user in O(1) rather than needing to enumerate and delete every cached key
  combination.

## 6. Testing

`server/src/tests/` — Jest + Supertest:

- `auth.validation.test.ts` — input validation (Zod schemas)
- `auth.flow.test.ts`, `auth.integration.test.ts` — signup/login/refresh/
  logout flows end-to-end against the test DB
- `transaction.test.ts` — CRUD + filtering
- `health.test.ts` — liveness endpoint

Run with `npm test` (server directory), `--runInBand` to avoid clashing on
a shared test database.
