import prisma from '../infra/prisma';
import { Prisma } from '../generated/prisma';

describe('Transaction.amount database constraints', () => {
  let userId: number;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: `constraints_${Date.now()}_${Math.random()}@test.com`,
        password: 'not-a-real-hash',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const insert = (amount: string) =>
    prisma.transaction.create({
      data: { amount: new Prisma.Decimal(amount), type: 'EXPENSE', category: 'FOOD', userId },
    });

  it.each([
    ['0'],
    ['-1'],
    ['0.001'], // rounds to 0.00 in numeric(19,2) and then violates the CHECK
    ['100000000000000000.00'], // one unit above the numeric(19,2) range
  ])('rejects an amount of %s and stores nothing', async (amount) => {
    await expect(insert(amount)).rejects.toThrow();
    expect(await prisma.transaction.count({ where: { userId } })).toBe(0);
  });

  it('stores 450.75 and reads it back exactly', async () => {
    const created = await insert('450.75');
    const stored = await prisma.transaction.findUniqueOrThrow({ where: { id: created.id } });
    expect(stored.amount.toFixed(2)).toBe('450.75');
  });

  it('sums 0.10 and 0.20 to exactly 0.30', async () => {
    await insert('0.10');
    await insert('0.20');
    const total = await prisma.transaction.aggregate({ where: { userId }, _sum: { amount: true } });
    expect(total._sum.amount?.toFixed(2)).toBe('0.30');
  });
});
