import { Decimal } from 'decimal.js';

let mockPrismaCreate = jest.fn();
let mockInvalidateFn = jest.fn();

jest.mock('../infra/prisma', () => ({
  transaction: {
    create: (...args: any[]) => mockPrismaCreate(...args),
  },
}));

jest.mock('../utils/redis/analyticsCache', () => ({
  invalidateAnalyticsForUser: (...args: any[]) => mockInvalidateFn(...args),
}));

import { createTransactionService } from './transaction.service';

describe('createTransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaCreate = jest.fn();
    mockInvalidateFn = jest.fn().mockResolvedValue(undefined);
  });

  it('awaits the write before invalidating cache', async () => {
    const mockTransaction = {
      id: 1,
      amount: new Decimal('100.00'),
      type: 'EXPENSE',
      category: 'FOOD',
      description: 'Test',
      userId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrismaCreate.mockResolvedValue(mockTransaction);

    const result = await createTransactionService(
      {
        amount: '100.00',
        type: 'EXPENSE',
        category: 'FOOD',
        description: 'Test',
        date: new Date().toISOString(),
      },
      1
    );

    expect(result).toBe(mockTransaction);
    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    expect(mockInvalidateFn).toHaveBeenCalledTimes(1);
    expect(mockInvalidateFn).toHaveBeenCalledWith(1);
  });

  it('does not invalidate cache when create fails', async () => {
    mockPrismaCreate.mockRejectedValue(new Error('DB error'));

    await expect(
      createTransactionService(
        {
          amount: '100.00',
          type: 'EXPENSE',
          category: 'FOOD',
          description: 'Test',
          date: new Date().toISOString(),
        },
        1
      )
    ).rejects.toThrow('DB error');

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    expect(mockInvalidateFn).not.toHaveBeenCalled();
  });
});