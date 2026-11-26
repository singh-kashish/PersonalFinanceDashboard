import request from 'supertest';
import app from '../app';
import prisma from '../infra/prisma';

// "*.flow.int.test.ts": the DB is reset once per file, so users created in beforeAll
// survive between tests (and we stay far below the signup rate limit).
const uniqueEmail = (label: string) => `${label}_${Date.now()}_${Math.random()}@test.com`;
const TWO_DECIMALS = /^\d+\.\d{2}$/;

describe('Transaction amounts over HTTP', () => {
  let tokenA = '';
  let tokenB = '';

  const asUser = (token: string) => ({ Authorization: `Bearer ${token}` });

  const createAs = (token: string, body: Record<string, unknown>) =>
    request(app)
      .post('/transactions')
      .set(asUser(token))
      .send({ type: 'EXPENSE', category: 'FOOD', ...body });

  beforeAll(async () => {
    const a = await request(app)
      .post('/auth/signup')
      .send({ email: uniqueEmail('a'), password: 'test123' });
    const b = await request(app)
      .post('/auth/signup')
      .send({ email: uniqueEmail('b'), password: 'test123' });
    tokenA = a.body.data.accessToken;
    tokenB = b.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /transactions', () => {
    it.each([
      ['450.75', '450.75'],
      ['5.5', '5.50'],
      ['450', '450.00'],
    ])('accepts %p and returns the amount as %p', async (amount, expected) => {
      const response = await createAs(tokenA, { amount });
      expect(response.status).toBe(201);
      expect(response.body.data.amount).toBe(expected);
    });

    it.each([
      [450.75],
      ['450.755'],
      ['0'],
      ['-5.00'],
      ['1e3'],
      ['100000000000000000.00'],
      [''],
    ])('rejects %p with 400', async (amount) => {
      const response = await createAs(tokenA, { amount });
      expect(response.status).toBe(400);
    });

    it('rejects a request without an amount', async () => {
      const response = await request(app)
        .post('/transactions')
        .set(asUser(tokenA))
        .send({ type: 'EXPENSE', category: 'FOOD' });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /transactions/:id', () => {
    const createOwn = async (amount: string) => {
      const response = await createAs(tokenA, { amount });
      return response.body.data.id as number;
    };

    it('accepts a valid amount and returns it with two decimals', async () => {
      const id = await createOwn('10.00');
      const response = await request(app)
        .patch(`/transactions/${id}`)
        .set(asUser(tokenA))
        .send({ amount: '200.5' });
      expect(response.status).toBe(200);
      expect(response.body.data.amount).toBe('200.50');
    });

    it.each([[450.75], ['0'], ['-1.00'], ['1.234']])(
      'rejects %p with 400 and leaves the stored amount unchanged',
      async (amount) => {
        const id = await createOwn('10.00');
        const response = await request(app)
          .patch(`/transactions/${id}`)
          .set(asUser(tokenA))
          .send({ amount });
        expect(response.status).toBe(400);

        const after = await request(app).get(`/transactions/${id}`).set(asUser(tokenA));
        expect(after.body.data.amount).toBe('10.00');
      }
    );

    it("returns 404 for another user's transaction and does not change it", async () => {
      const id = await createOwn('10.00');
      const response = await request(app)
        .patch(`/transactions/${id}`)
        .set(asUser(tokenB))
        .send({ amount: '99.00' });
      expect(response.status).toBe(404);

      const after = await request(app).get(`/transactions/${id}`).set(asUser(tokenA));
      expect(after.body.data.amount).toBe('10.00');
    });
  });

  describe('GET /transactions', () => {
    it('returns amounts as two-decimal strings in the list', async () => {
      const first = await createAs(tokenA, { amount: '450.5' });
      const second = await createAs(tokenA, { amount: '0.1' });

      const response = await request(app)
        .get('/transactions?limit=100')
        .set(asUser(tokenA));
      expect(response.status).toBe(200);

      const items: Array<{ id: number; amount: string }> = response.body.data.transactions;
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item) => TWO_DECIMALS.test(item.amount))).toBe(true);
      expect(items.find((item) => item.id === first.body.data.id)?.amount).toBe('450.50');
      expect(items.find((item) => item.id === second.body.data.id)?.amount).toBe('0.10');
    });

    it('returns the amount as a two-decimal string for a single transaction', async () => {
      const created = await createAs(tokenA, { amount: '1234.5' });
      const response = await request(app)
        .get(`/transactions/${created.body.data.id}`)
        .set(asUser(tokenA));
      expect(response.status).toBe(200);
      expect(response.body.data.amount).toBe('1234.50');
    });
  });
});
