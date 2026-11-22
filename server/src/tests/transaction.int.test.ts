import request from 'supertest';
import app from '../app';
import prisma from '../infra/prisma';

describe('Transaction integration tests', () => {
  let user1AccessToken: string;
  let user2AccessToken: string;
  let transactionId: number;

  beforeEach(async () => {
    // Create user1
    const signup1 = await request(app)
      .post('/auth/signup')
      .send({ email: `user1_${Date.now()}_${Math.random()}@test.com`, password: 'test123' });
    user1AccessToken = signup1.body.data.accessToken;

    // Create user2
    const signup2 = await request(app)
      .post('/auth/signup')
      .send({ email: `user2_${Date.now()}_${Math.random()}@test.com`, password: 'test123' });
    user2AccessToken = signup2.body.data.accessToken;

    // Create a transaction for user1
    const createRes = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${user1AccessToken}`)
      .send({
        amount: '100.00',
        type: 'EXPENSE',
        category: 'FOOD',
        description: 'Test transaction',
        date: new Date().toISOString()
      });
    transactionId = createRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('updateTransaction', () => {
    it('returns the updated transaction', async () => {
      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ amount: '200.00', description: 'Updated' });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(transactionId);
      expect(response.body.data.amount).toBe('200.00');
      expect(response.body.data.description).toBe('Updated');
    });

    it('returns 404 for another user\'s transaction', async () => {
      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({ amount: '50.00' });
      
      expect(response.status).toBe(404);
    });

    it('returns 404 for non-existent transaction', async () => {
      const response = await request(app)
        .patch('/transactions/999999')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ amount: '50.00' });
      
      expect(response.status).toBe(404);
    });
  });
});