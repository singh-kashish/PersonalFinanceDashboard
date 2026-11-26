import request from 'supertest';
import app from '../app';

// Uses the REAL app, so this fails if /auth/signup ever loses its limiter. Invalid payloads
// keep the loop fast (no password hashing); the limiter runs before validation.
describe('POST /auth/signup rate limiting (real route)', () => {
  it('answers 429 after repeated requests while other routes stay available', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const response = await request(app).post('/auth/signup').send({});
      statuses.push(response.status);
      if (response.status === 429) break;
    }

    const limitedAt = statuses.indexOf(429);
    expect(limitedAt).toBeGreaterThan(0); // never blocked on the very first request
    expect(statuses.slice(0, limitedAt).every((status) => status === 400)).toBe(true);

    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
  });
});
