import { Decimal } from "decimal.js";

/**
 * Money helpers for Flo (AGENTS.md section 3).
 *
 * - Money is never a JS number: it is a decimal string at the API boundary and a
 *   Decimal inside the server.
 * - All money arithmetic goes through this module.
 * - The database type is numeric(19, 2). Where rounding is needed we use
 *   ROUND_HALF_EVEN ("banker's rounding") unless a caller passes another mode.
 */

// Private clone: a global Decimal.set() elsewhere can never change our behavior.
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_EVEN });

export type Money = Decimal;

export const MONEY_SCALE = 2;

/** Largest magnitude that fits numeric(19, 2). */
export const MAX_MONEY: Money = new D("99999999999999999.99");

export type MoneyErrorCode =
  | "INVALID_TYPE"
  | "INVALID_FORMAT"
  | "TOO_MANY_DECIMALS"
  | "NOT_FINITE"
  | "NOT_POSITIVE"
  | "NEGATIVE"
  | "OUT_OF_RANGE";

export class MoneyError extends Error {
  readonly code: MoneyErrorCode;

  constructor(code: MoneyErrorCode, message: string) {
    super(message);
    this.name = "MoneyError";
    this.code = code;
  }
}

export interface ParseMoneyOptions {
  /** Accept zero (default false: transaction amounts must be positive). */
  allowZero?: boolean;
  /** Accept negative values (default false), for example for balances. */
  allowNegative?: boolean;
}

const DECIMAL_STRING = /^(-?)(\d+)(?:\.(\d+))?$/;

/**
 * Parses and validates a money value from the outside world.
 * Strings must look like "450.75": no spaces, exponents, thousands separators or
 * more than 2 decimal places. JS numbers are rejected on purpose.
 */
export function parseMoney(
  input: string | Money,
  options: ParseMoneyOptions = {}
): Money {
  const { allowZero = false, allowNegative = false } = options;

  let value: Money;
  if (typeof input === "string") {
    const match = DECIMAL_STRING.exec(input);
    if (!match) {
      throw new MoneyError(
        "INVALID_FORMAT",
        'Money must be a plain decimal string such as "450.75"'
      );
    }
    const fraction = match[3];
    if (fraction !== undefined && fraction.length > MONEY_SCALE) {
      throw new MoneyError(
        "TOO_MANY_DECIMALS",
        `Money allows at most ${MONEY_SCALE} decimal places`
      );
    }
    value = new D(input);
  } else if (D.isDecimal(input)) {
    if (!input.isFinite()) {
      throw new MoneyError("NOT_FINITE", "Money must be a finite number");
    }
    if (input.decimalPlaces() > MONEY_SCALE) {
      throw new MoneyError(
        "TOO_MANY_DECIMALS",
        `Money allows at most ${MONEY_SCALE} decimal places`
      );
    }
    value = new D(input);
  } else {
    throw new MoneyError(
      "INVALID_TYPE",
      "Money must be a decimal string or Decimal, never a JS number"
    );
  }

  if (value.isZero()) {
    if (!allowZero) {
      throw new MoneyError("NOT_POSITIVE", "Money must be greater than zero");
    }
    return new D("0");
  }
  if (value.isNegative() && !allowNegative) {
    throw new MoneyError("NEGATIVE", "Money must not be negative");
  }
  if (value.abs().greaterThan(MAX_MONEY)) {
    throw new MoneyError("OUT_OF_RANGE", "Money exceeds the supported range");
  }
  return value;
}

/** Formats money for API responses: always exactly 2 decimals, for example "450.75". */
export function toApiString(value: Money): string {
  if (!D.isDecimal(value)) {
    throw new MoneyError("INVALID_TYPE", "Money must be a Decimal");
  }
  if (!value.isFinite()) {
    throw new MoneyError("NOT_FINITE", "Money must be a finite number");
  }
  if (value.decimalPlaces() > MONEY_SCALE) {
    throw new MoneyError(
      "TOO_MANY_DECIMALS",
      "Round explicitly before formatting: more than 2 decimal places"
    );
  }
  if (value.isZero()) {
    return "0.00";
  }
  return value.toFixed(MONEY_SCALE, Decimal.ROUND_HALF_EVEN);
}

const d = (value: Money): Money => {
  if (!D.isDecimal(value)) {
    throw new MoneyError("INVALID_TYPE", "Money must be a Decimal");
  }
  return new D(value);
};

export function add(a: Money, b: Money): Money {
  return d(a).plus(d(b));
}

export function subtract(a: Money, b: Money): Money {
  return d(a).minus(d(b));
}

/** Sum of a list; the sum of an empty list is zero. */
export function sum(values: readonly Money[]): Money {
  return values.reduce<Money>((total, value) => total.plus(d(value)), new D("0"));
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  return d(a).comparedTo(d(b)) as -1 | 0 | 1;
}

export function equals(a: Money, b: Money): boolean {
  return d(a).equals(d(b));
}
