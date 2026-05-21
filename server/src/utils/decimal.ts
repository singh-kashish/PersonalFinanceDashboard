import { Decimal } from '@prisma/client/runtime/library';

export const toNumber = (
  value: Decimal | null
): number => {
  return value
    ? value.toNumber()
    : 0;
};