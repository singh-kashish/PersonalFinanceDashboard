import request from 'supertest';
import app from '../app';
import prisma from '../infra/prisma';

describe('Analytics integration tests', () => {
  let user1Token: string;
  let user2Token: string;

  beforeEach(async () => {
    const signup1 = await request(app)
      .post('/auth/signup')
      .send({ email: `user1_${Date.now()}_${Math.random()}@test.com`, password: 'test123' });
    user1Token = signup1.body.data.accessToken;

    const signup2 = await request(app)
      .post('/auth/signup')
      .send({ email: `user2_${Date.now()}_${Math.random()}@test.com`, password: 'test123' });
    user2Token = signup2.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /analytics/summary', () => {
    it('empty user returns 0.00 strings', async () => {
      const res = await request(app)
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.totalIncome).toBe('0.00');
      expect(res.body.data.totalExpense).toBe('0.00');
      expect(res.body.data.balance).toBe('0.00');
      expect(typeof res.body.data.totalIncome).toBe('string');
    });

    it('one transaction returns correct strings', async () => {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.50', type: 'INCOME', category: 'SALARY', date: new Date().toISOString() });

      const res = await request(app)
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.totalIncome).toBe('100.50');
      expect(res.body.data.totalExpense).toBe('0.00');
      expect(res.body.data.balance).toBe('100.50');
    });

    it('fractional sums (0.1 + 0.2) work correctly', async () => {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '0.10', type: 'INCOME', category: 'A', date: new Date().toISOString() });
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '0.20', type: 'INCOME', category: 'B', date: new Date().toISOString() });

      const res = await request(app)
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.totalIncome).toBe('0.30');
    });

    it('income vs expense balance (negative allowed)', async () => {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'INCOME', category: 'SALARY', date: new Date().toISOString() });
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '150.00', type: 'EXPENSE', category: 'RENT', date: new Date().toISOString() });

      const res = await request(app)
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.totalIncome).toBe('100.00');
      expect(res.body.data.totalExpense).toBe('150.00');
      expect(res.body.data.balance).toBe('-50.00');
    });

    it('UTC date-range boundaries', async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '50.00', type: 'INCOME', category: 'A', date: startOfMonth.toISOString() });
      
      const res = await request(app)
        .get(`/analytics/summary?from=${startOfMonth.toISOString()}&to=${endOfMonth.toISOString()}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.totalIncome).toBe('50.00');
    });

    it('user isolation', async () => {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'INCOME', category: 'SALARY', date: new Date().toISOString() });

      const res = await request(app)
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${user2Token}`);
      
      expect(res.body.data.totalIncome).toBe('0.00');
    });
  });

  describe('GET /analytics/categories', () => {
    it('sums to 100.00 with three equal categories', async () => {
      const date = new Date().toISOString();
      await request(app).post('/transactions').set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'EXPENSE', category: 'FOOD', date });
      await request(app).post('/transactions').set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'EXPENSE', category: 'TRANSPORT', date });
      await request(app).post('/transactions').set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'EXPENSE', category: 'ENTERTAINMENT', date });

      const res = await request(app)
        .get('/analytics/categories')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.status).toBe(200);
      const cats = res.body.data.categories;
      expect(cats.length).toBe(3);
      const percentages = cats.map((c: { percentage: string; totalAmount: string }) => parseFloat(c.percentage));
      const total = percentages.reduce((a: number, b: number) => a + b, 0);
      expect(total).toBe(100.00);
      expect(cats.every((c: { percentage: string; totalAmount: string }) => typeof c.totalAmount === 'string')).toBe(true);
    });

    it('zero total returns 0.00', async () => {
      const res = await request(app)
        .get('/analytics/categories')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.categories).toEqual([]);
    });

    it('one category returns 100.00', async () => {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '500.00', type: 'EXPENSE', category: 'FOOD', date: new Date().toISOString() });

      const res = await request(app)
        .get('/analytics/categories')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.categories.length).toBe(1);
      expect(parseFloat(res.body.data.categories[0].percentage)).toBe(100.00);
    });

    it('user isolation', async () => {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'EXPENSE', category: 'FOOD', date: new Date().toISOString() });

      const res = await request(app)
        .get('/analytics/categories')
        .set('Authorization', `Bearer ${user2Token}`);
      
      expect(res.body.data.categories).toEqual([]);
    });
  });

  describe('GET /analytics/monthly', () => {
    const getMonthlyRange = () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1).toISOString();
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
      return { from, to };
    };

    it('UTC month boundaries', async () => {
      const { from, to } = getMonthlyRange();
      const now = new Date();
      const jan = new Date(now.getFullYear(), 0, 15);
      const feb = new Date(now.getFullYear(), 1, 15);
      
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'INCOME', category: 'A', date: jan.toISOString() });
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '50.00', type: 'EXPENSE', category: 'B', date: feb.toISOString() });

      const res = await request(app)
        .get(`/analytics/monthly?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.monthly.length).toBeGreaterThanOrEqual(2);
      const janEntry = res.body.data.monthly.find((m: { month: string; income: string; expense: string; balance: string }) => m.month === `${now.getFullYear()}-01`);
      const febEntry = res.body.data.monthly.find((m: { month: string; income: string; expense: string; balance: string }) => m.month === `${now.getFullYear()}-02`);
      expect(janEntry.income).toBe('100.00');
      expect(febEntry.expense).toBe('50.00');
    });

    it('income-only month', async () => {
      const { from, to } = getMonthlyRange();
      const now = new Date();
      const mar = new Date(now.getFullYear(), 2, 15);
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '200.00', type: 'INCOME', category: 'A', date: mar.toISOString() });

      const res = await request(app)
        .get(`/analytics/monthly?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      const marEntry = res.body.data.monthly.find((m: { month: string; income: string; expense: string; balance: string }) => m.month === `${now.getFullYear()}-03`);
      expect(marEntry.income).toBe('200.00');
      expect(marEntry.expense).toBe('0.00');
      expect(marEntry.balance).toBe('200.00');
    });

    it('expense-only month', async () => {
      const { from, to } = getMonthlyRange();
      const now = new Date();
      const apr = new Date(now.getFullYear(), 3, 15);
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '75.00', type: 'EXPENSE', category: 'A', date: apr.toISOString() });

      const res = await request(app)
        .get(`/analytics/monthly?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      const aprEntry = res.body.data.monthly.find((m: { month: string; income: string; expense: string; balance: string }) => m.month === `${now.getFullYear()}-04`);
      expect(aprEntry.income).toBe('0.00');
      expect(aprEntry.expense).toBe('75.00');
      expect(aprEntry.balance).toBe('-75.00');
    });

    it('ordering is chronological', async () => {
      const { from, to } = getMonthlyRange();
      const now = new Date();
      const months = [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 1, 1), new Date(now.getFullYear(), 2, 1)];
      
      for (const m of months) {
        await request(app)
          .post('/transactions')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ amount: '10.00', type: 'INCOME', category: 'A', date: m.toISOString() });
      }

      const res = await request(app)
        .get(`/analytics/monthly?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      const monthsList = res.body.data.monthly.map((m: { month: string; income: string; expense: string; balance: string }) => m.month);
      const sorted = [...monthsList].sort();
      expect(monthsList).toEqual(sorted);
    });

    it('user isolation', async () => {
      const { from, to } = getMonthlyRange();
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'INCOME', category: 'A', date: new Date().toISOString() });

      const res = await request(app)
        .get(`/analytics/monthly?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user2Token}`);
      
      expect(res.body.data.monthly).toEqual([]);
    });

    it('recent transactions limit unchanged', async () => {
      const { from, to } = getMonthlyRange();
      for (let i = 0; i < 60; i++) {
        await request(app)
          .post('/transactions')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ amount: '10.00', type: 'INCOME', category: 'A', date: new Date().toISOString() });
      }

      const res = await request(app)
        .get(`/analytics/monthly?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.recentTransactions.length).toBeLessThanOrEqual(50);
    });
  });

  describe('GET /analytics/category-trends', () => {
    const getTrendsRange = () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1).toISOString();
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
      return { from, to };
    };

    it('UTC month boundaries', async () => {
      const { from, to } = getTrendsRange();
      const now = new Date();
      const jan = new Date(now.getFullYear(), 0, 15);
      const feb = new Date(now.getFullYear(), 1, 15);
      
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'EXPENSE', category: 'FOOD', date: jan.toISOString() });
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '50.00', type: 'EXPENSE', category: 'FOOD', date: feb.toISOString() });

      const res = await request(app)
        .get(`/analytics/category-trends?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      const janEntry = res.body.data.find((t: { month: string; category: string; amount: string }) => t.month === `${now.getFullYear()}-01` && t.category === 'FOOD');
      const febEntry = res.body.data.find((t: { month: string; category: string; amount: string }) => t.month === `${now.getFullYear()}-02` && t.category === 'FOOD');
      expect(janEntry.amount).toBe('100.00');
      expect(febEntry.amount).toBe('50.00');
    });

    it('ordering is chronological', async () => {
      const { from, to } = getTrendsRange();
      const now = new Date();
      const months = [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 1, 1)];
      
      for (const m of months) {
        await request(app)
          .post('/transactions')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ amount: '10.00', type: 'EXPENSE', category: 'FOOD', date: m.toISOString() });
      }

      const res = await request(app)
        .get(`/analytics/category-trends?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      const monthsList = res.body.data.map((t: { month: string; category: string; amount: string }) => t.month);
      const sorted = [...monthsList].sort();
      expect(monthsList).toEqual(sorted);
    });

    it('user isolation', async () => {
      const { from, to } = getTrendsRange();
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ amount: '100.00', type: 'EXPENSE', category: 'FOOD', date: new Date().toISOString() });

      const res = await request(app)
        .get(`/analytics/category-trends?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${user2Token}`);
      
      expect(res.body.data).toEqual([]);
    });
  });
});
