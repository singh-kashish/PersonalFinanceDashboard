import { Decimal } from '@prisma/client/runtime/library';

export const toNumber = (
  value: Decimal | 0
): number => {
  return value
    ? value.toNumber()
    : 0;
};