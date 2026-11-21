import { Decimal } from 'decimal.js';
import { toApiString } from './money';

/** Serializes a Prisma Transaction to ensure amount is a 2-decimal string. */
export function serializeTransaction(tx: {
  amount: Decimal | string | number;
  [key: string]: any;
}): { amount: string; [key: string]: any } {
  return {
    ...tx,
    amount: toApiString(tx.amount as Decimal),
  };
}

/** Serializes a list of transactions. */
export function serializeTransactions(transactions: Array<{
  amount: Decimal | string | number;
  [key: string]: any;
}>): Array<{ amount: string; [key: string]: any }> {
  return transactions.map(serializeTransaction);
}