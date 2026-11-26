import { Decimal } from 'decimal.js';
import { Prisma } from '../generated/prisma';
import { serializeTransaction, serializeTransactions } from './transaction.serializer';

type Tx = { id: number; category: string; amount: Decimal };

const tx = (id: number, amount: string): Tx => ({
  id,
  category: 'FOOD',
  amount: new Decimal(amount),
});

describe('serializeTransaction', () => {
  it.each([
    ['450.5', '450.50'],
    ['0.1', '0.10'],
    ['1000', '1000.00'],
    ['450.75', '450.75'],
  ])('formats %s as the two-decimal string %s', (input, expected) => {
    const out = serializeTransaction(tx(1, input));
    expect(out.amount).toBe(expected);
    expect(typeof out.amount).toBe('string');
  });

  it('accepts the Decimal type that Prisma returns', () => {
    const fromPrisma = {
      id: 2,
      category: 'FOOD',
      amount: new Prisma.Decimal('450.5') as unknown as Decimal,
    };
    expect(serializeTransaction(fromPrisma).amount).toBe('450.50');
  });

  it('keeps every other field untouched', () => {
    expect(serializeTransaction(tx(3, '5'))).toMatchObject({ id: 3, category: 'FOOD' });
  });
});

describe('serializeTransactions', () => {
  it('serializes every item in the list', () => {
    const out = serializeTransactions([tx(1, '450.5'), tx(2, '0.1'), tx(3, '12')]);
    expect(out.map((item) => item.amount)).toEqual(['450.50', '0.10', '12.00']);
  });

  it('returns an empty list for an empty list', () => {
    expect(serializeTransactions([])).toEqual([]);
  });
});
