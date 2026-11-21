import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../routes/auth.routes';
import { authLimiter } from '../middlewares/rateLimit.middleware';

describe('Auth signup rate limiting', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    // Apply authLimiter to signup exactly as in the real routes
    app.post('/auth/signup', authLimiter, (req, res) => {
      res.status(201).json({ success: true, message: 'Signup successful' });
    });
  });

  it('returns 429 after exceeding the limit', async () => {
    const payload = { email: 'test@example.com', password: 'password123' };
    
    // Make requests up to the limit (20)
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .post('/auth/signup')
        .send({ ...payload, email: `test${i}@example.com` });
      expect(res.status).toBe(201);
    }
    
    // The 21st request should be rate limited
    const res = await request(app)
      .post('/auth/signup')
      .send({ ...payload, email: 'test21@example.com' });
    
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Too many requests');
  });
});