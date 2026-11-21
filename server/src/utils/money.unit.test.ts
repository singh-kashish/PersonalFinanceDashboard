import { Decimal } from "decimal.js";
import * as fc from "fast-check";
import {
  add,
  compare,
  equals,
  MAX_MONEY,
  MoneyError,
  parseMoney,
  subtract,
  sum,
  toApiString,
} from "./money";

const money = (value: string) => parseMoney(value, { allowZero: true, allowNegative: true });

/** Integer cents -> "12.34" using only integer math (no floats). */
const centsToString = (cents: number) =>
  `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
const moneyString = fc.integer({ min: 1, max: 99_999_999_999 }).map(centsToString);

describe("parseMoney", () => {
  it.each([
    ["450.75", "450.75"],
    ["450", "450.00"],
    ["0.01", "0.01"],
    ["5.5", "5.50"],
    ["007.50", "7.50"],
    ["99999999999999999.99", "99999999999999999.99"],
  ])("accepts %s", (input, expected) => {
    expect(toApiString(parseMoney(input))).toBe(expected);
  });

  it.each([
    "",
    " 5",
    "5 ",
    "1e3",
    ".5",
    "5.",
    "1,000.00",
    "abc",
    "--5",
    "+5",
    "NaN",
    "Infinity",
  ])("rejects malformed string %p", (input) => {
    expect(() => parseMoney(input, { allowNegative: true })).toThrow(
      expect.objectContaining({ code: "INVALID_FORMAT" })
    );
  });

  it.each(["1.234", "0.001", "10.100"])("rejects more than 2 decimals: %s", (input) => {
    expect(() => parseMoney(input)).toThrow(
      expect.objectContaining({ code: "TOO_MANY_DECIMALS" })
    );
  });

  it("rejects zero by default and accepts it with allowZero", () => {
    expect(() => parseMoney("0")).toThrow(expect.objectContaining({ code: "NOT_POSITIVE" }));
    expect(() => parseMoney("0.00")).toThrow(
      expect.objectContaining({ code: "NOT_POSITIVE" })
    );
    expect(toApiString(parseMoney("0.00", { allowZero: true }))).toBe("0.00");
    expect(toApiString(parseMoney("-0", { allowZero: true, allowNegative: true }))).toBe(
      "0.00"
    );
  });

  it("rejects negatives by default and accepts them with allowNegative", () => {
    expect(() => parseMoney("-5.00")).toThrow(expect.objectContaining({ code: "NEGATIVE" }));
    expect(toApiString(parseMoney("-12.30", { allowNegative: true }))).toBe("-12.30");
  });

  it("enforces the numeric(19,2) range", () => {
    expect(() => parseMoney("100000000000000000.00")).toThrow(
      expect.objectContaining({ code: "OUT_OF_RANGE" })
    );
    expect(() => parseMoney("-100000000000000000.00", { allowNegative: true })).toThrow(
      expect.objectContaining({ code: "OUT_OF_RANGE" })
    );
    expect(parseMoney(MAX_MONEY).equals(MAX_MONEY)).toBe(true);
  });

  it("rejects JS numbers at runtime", () => {
    expect(() => parseMoney(42 as unknown as string)).toThrow(
      expect.objectContaining({ code: "INVALID_TYPE" })
    );
    expect(() => parseMoney(0.1 as unknown as string)).toThrow(
      expect.objectContaining({ code: "INVALID_TYPE" })
    );
  });

  it("accepts Decimal instances, including ones from another Decimal clone", () => {
    const Other = Decimal.clone({ precision: 5 });
    expect(toApiString(parseMoney(new Decimal("12.5")))).toBe("12.50");
    expect(toApiString(parseMoney(new Other("12.5")))).toBe("12.50");
  });

  it("rejects non-finite and over-precise Decimals", () => {
    expect(() => parseMoney(new Decimal(NaN))).toThrow(
      expect.objectContaining({ code: "NOT_FINITE" })
    );
    expect(() => parseMoney(new Decimal(Infinity))).toThrow(
      expect.objectContaining({ code: "NOT_FINITE" })
    );
    expect(() => parseMoney(new Decimal("1.234"))).toThrow(
      expect.objectContaining({ code: "TOO_MANY_DECIMALS" })
    );
  });

  it("throws MoneyError with a name and a code", () => {
    try {
      parseMoney("abc");
      throw new Error("expected parseMoney to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(MoneyError);
      expect((error as MoneyError).name).toBe("MoneyError");
      expect((error as MoneyError).code).toBe("INVALID_FORMAT");
    }
  });

  it("round-trips every generated amount exactly", () => {
    fc.assert(
      fc.property(moneyString, (text) => {
        expect(toApiString(parseMoney(text))).toBe(text);
      })
    );
  });

  it("rejects any amount with three decimals", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999_999 }), fc.integer({ min: 0, max: 999 }), (whole, frac) => {
        const text = `${whole}.${String(frac).padStart(3, "0")}`;
        expect(() => parseMoney(text)).toThrow(MoneyError);
      })
    );
  });
});

describe("toApiString", () => {
  it("always prints exactly two decimals and normalizes zero", () => {
    expect(toApiString(money("5"))).toBe("5.00");
    expect(toApiString(money("0"))).toBe("0.00");
    expect(toApiString(money("-0.5"))).toBe("-0.50");
  });

  it("refuses to silently round", () => {
    expect(() => toApiString(new Decimal("1.005"))).toThrow(
      expect.objectContaining({ code: "TOO_MANY_DECIMALS" })
    );
  });

  it("rejects non-Decimal and non-finite values", () => {
    expect(() => toApiString(1.5 as unknown as Decimal)).toThrow(
      expect.objectContaining({ code: "INVALID_TYPE" })
    );
    expect(() => toApiString(new Decimal(NaN))).toThrow(
      expect.objectContaining({ code: "NOT_FINITE" })
    );
  });
});

describe("arithmetic", () => {
  it("does not suffer from floating point errors", () => {
    expect(0.1 + 0.2).not.toBe(0.3); // the problem we are avoiding
    expect(toApiString(add(money("0.10"), money("0.20")))).toBe("0.30");
    expect(toApiString(sum(Array.from({ length: 10 }, () => money("0.10"))))).toBe("1.00");
  });

  it("subtracts into negative values", () => {
    expect(toApiString(subtract(money("1.00"), money("2.50")))).toBe("-1.50");
    expect(toApiString(subtract(money("2.50"), money("2.50")))).toBe("0.00");
  });

  it("sums an empty list to zero", () => {
    expect(toApiString(sum([]))).toBe("0.00");
  });

  it("compares and tests equality", () => {
    expect(compare(money("1.00"), money("2.00"))).toBe(-1);
    expect(compare(money("2.00"), money("2.00"))).toBe(0);
    expect(compare(money("3.00"), money("2.00"))).toBe(1);
    expect(equals(money("2.5"), money("2.50"))).toBe(true);
    expect(equals(money("2.5"), money("2.51"))).toBe(false);
  });

  it("rejects JS numbers in every operation", () => {
    const bad = 1.5 as unknown as Decimal;
    expect(() => add(bad, money("1"))).toThrow(MoneyError);
    expect(() => subtract(money("1"), bad)).toThrow(MoneyError);
    expect(() => sum([money("1"), bad])).toThrow(MoneyError);
    expect(() => compare(bad, money("1"))).toThrow(MoneyError);
    expect(() => equals(money("1"), bad)).toThrow(MoneyError);
  });

  it("add is commutative and associative", () => {
    fc.assert(
      fc.property(moneyString, moneyString, moneyString, (a, b, c) => {
        const [x, y, z] = [money(a), money(b), money(c)] as [Decimal, Decimal, Decimal];
        expect(equals(add(x, y), add(y, x))).toBe(true);
        expect(equals(add(add(x, y), z), add(x, add(y, z)))).toBe(true);
      })
    );
  });

  it("a + b - b equals a", () => {
    fc.assert(
      fc.property(moneyString, moneyString, (a, b) => {
        const [x, y] = [money(a), money(b)] as [Decimal, Decimal];
        expect(equals(subtract(add(x, y), y), x)).toBe(true);
      })
    );
  });

  it("sum does not depend on order and equals the fold of add", () => {
    fc.assert(
      fc.property(fc.array(moneyString, { maxLength: 30 }), (texts) => {
        const values = texts.map(money);
        const folded = values.reduce((acc, v) => add(acc, v), money("0"));
        expect(equals(sum(values), folded)).toBe(true);
        expect(equals(sum(values), sum([...values].reverse()))).toBe(true);
      })
    );
  });

  it("compare is antisymmetric", () => {
    fc.assert(
      fc.property(moneyString, moneyString, (a, b) => {
        const [x, y] = [money(a), money(b)] as [Decimal, Decimal];
        expect(compare(x, y)).toBe(-compare(y, x) + 0);
      })
    );
  });
});
