# 0001. Store and compute money as fixed-precision decimals

- Status: Accepted (merging this PR confirms it)
- Date: 2026-11
- Deciders: owner
- Related issues: P4 (money module), P5 (Decimal(19,2) migration), P6 (analytics refactor)

## Context

Flo is a finance tracker. Floating point cannot represent values such as 0.10 exactly
(`0.1 + 0.2 !== 0.3`), so JS `number` must never hold or add money. The schema already
uses a Prisma `Decimal`, which Prisma maps to an unbounded numeric(65, 30) column. The
backend is Node/TypeScript, and amounts cross the API as JSON.

## Options considered

### Option A: integer minor units (paise or cents) in a BIGINT column
- How it works: store 450.75 as 45075 plus a currency code; convert at the edges.
- Pros: exact and fast; matches Stripe and most payment APIs; no decimal library for sums.
- Cons: Prisma returns BigInt (not JSON serializable by default); easy to mix up units
  and scales; percentages, FX and fractional rates still need decimals; existing data
  needs a migration.
- Best when: payments are the core domain and every currency has a known minor unit.
- Cost to reverse: medium (data and code migration).

### Option B: fixed-precision decimal (numeric(19, 2)) plus decimal.js in code (chosen)
- How it works: Postgres stores numeric(19, 2); the server uses decimal.js through one
  `money` module; the API sends and accepts decimal strings such as "450.75".
- Pros: exact; already the Prisma model; a common choice for ledgers and finance apps;
  easy to read in SQL; small migration (tighten the column type).
- Cons: need a decimal library and discipline (never `Number(...)`); strings at the API
  boundary; per-currency scale needs extra care later.
- Best when: amounts are mostly additions and percentages, as in a tracker or dashboard.
- Cost to reverse: medium.

### Option C: keep JS numbers and round with toFixed
- Pros: no work. Cons: silent errors accumulate; unacceptable for money. Rejected.

## Decision

Option B. All money arithmetic goes through `server/src/utils/money.ts`. Rounding is
explicit (ROUND_HALF_EVEN by default). API responses and requests use decimal strings.
JS numbers are rejected at runtime.

## Consequences

- Positive: exact sums and percentages; one module to test and audit; a direct, small
  migration path (P5).
- Negative: strings at the API boundary; a currency dimension still has to be added.
- Follow-ups: P5 changes the column to `@db.Decimal(19, 2)` with a `CHECK (amount > 0)`;
  P6 moves analytics to this module.

## Revisit when

Multi-currency or fractional minor units (for example crypto or per-mille rates) become
requirements, or Stripe-driven flows dominate the data model.

## Evidence

Common practice for ledger-style data; decimal.js is the library Prisma itself uses for
`Decimal`. Prisma's mapping of unbounded `Decimal` to numeric(65, 30) is taken from the
repo's own migration (see docs/INSPECTION.md).
