import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Complete auth flow', () => {

  const payload = {
    email: `flow${Date.now()}@gmail.com`,
    password: 'tester101'
  };

  let accessToken = '';
  let refreshCookie: string = '';

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: payload.email
      }
    });

    await prisma.$disconnect();
  });

  it('signup creates user and returns tokens', async () => {

    const response = await request(app)
      .post('/auth/signup')
      .send(payload);

    expect(response.status).toBe(201);

    expect(
      response.body.data.accessToken
    ).toBeDefined();

    expect(
      response.headers['set-cookie']
    ).toBeDefined();

    accessToken =
      response.body.data.accessToken;
    if(response.headers['set-cookie'])refreshCookie =
      response.headers['set-cookie'];

  });

  it('protected route works', async () => {

    const response =
      await request(app)
        .get('/auth/me')
        .set(
          'Authorization',
          `Bearer ${accessToken}`
        );

    expect(response.status)
      .toBe(200);

    expect(
      response.body.data.email
    ).toBe(payload.email);

  });

  it('refresh rotates tokens', async () => {

    const oldCookie =
      refreshCookie;

    const response =
      await request(app)
        .post('/auth/refresh')
        .set(
          'Cookie',
          refreshCookie
        );

    expect(response.status)
      .toBe(200);

    expect(
      response.body.data.accessToken
    ).toBeDefined();

    expect(
      response.headers['set-cookie']
    ).toBeDefined();

    accessToken =
      response.body.data.accessToken;
    if(response.headers['set-cookie'])
    refreshCookie =
      response.headers['set-cookie'];

    expect(
      refreshCookie
    ).not.toEqual(
      oldCookie
    );

  });

  it('logout clears session', async () => {

    const response =
      await request(app)
        .post('/auth/logout')
        .set(
          'Cookie',
          refreshCookie
        );

    expect(response.status)
      .toBe(200);

  });

  it('refresh after logout fails', async () => {

    const response =
      await request(app)
        .post('/auth/refresh')
        .set(
          'Cookie',
          refreshCookie
        );

    expect(response.status)
      .toBe(401);

  });

});