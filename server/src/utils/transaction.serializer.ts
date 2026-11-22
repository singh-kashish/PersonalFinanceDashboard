import { Decimal } from 'decimal.js';
import { toApiString } from './money';

/** Serializes a Prisma Transaction to ensure amount is a 2-decimal string. */
export function serializeTransaction<T extends { amount: Decimal | string | number }>(
  tx: T
): T & { amount: string } {
  return {
    ...tx,
    amount: toApiString(tx.amount as Decimal),
  };
}

/** Serializes a list of transactions. */
export function serializeTransactions<T extends { amount: Decimal | string | number }>(
  transactions: T[]
): Array<T & { amount: string }> {
  return transactions.map(serializeTransaction);
}