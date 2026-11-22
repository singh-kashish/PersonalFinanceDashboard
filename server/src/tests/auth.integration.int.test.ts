import request from 'supertest';
import app from '../app';
import prisma from '../infra/prisma';

describe('Auth integration tests',()=>{

  const payload = {
    email:`integration${Date.now()}@gmail.com`,
    password:'tester101'
  };

  let refreshCookie:string='';
  let userId:number;

  beforeAll(async()=>{

    const signupResponse =
      await request(app)
      .post('/auth/signup')
      .send(payload);

    refreshCookie =
      signupResponse.headers[
        'set-cookie'
      ]!;

    const user =
      await prisma.user.findUnique({
        where:{
          email:payload.email
        }
      });

    userId = user!.id;

  });

  afterAll(async()=>{

    // delete children first

    await prisma.refreshToken.deleteMany({
      where:{
        userId
      }
    });

    await prisma.user.deleteMany({
      where:{
        id:userId
      }
    });

    await prisma.$disconnect();

  });

  it(
    'logout removes refresh token',
    async()=>{

      await request(app)
        .post('/auth/logout')
        .set(
          'Cookie',
          refreshCookie
        );

      const tokens =
        await prisma.refreshToken
        .findMany({
          where:{
            userId
          }
        });

      expect(
        tokens.length
      ).toBe(0);

    }
  );

  describe('logout-all', () => {
    let userAccessToken: string;
    let userRefreshCookie: string;
    let userId2: number;

    beforeAll(async () => {
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send({ email: `logoutall${Date.now()}@test.com`, password: 'test123' });
      userAccessToken = signupResponse.body.data.accessToken;
      userRefreshCookie = signupResponse.headers['set-cookie']!;
      const user = await prisma.user.findUnique({ where: { email: signupResponse.body.data.user.email } });
      userId2 = user!.id;
    });

    afterAll(async () => {
      await prisma.refreshToken.deleteMany({ where: { userId: userId2 } });
      await prisma.user.deleteMany({ where: { id: userId2 } });
    });

    it('returns 200 with no refresh token cookie (but valid access token)', async () => {
      const response = await request(app)
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${userAccessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out from all devices');
    });

    it('returns 200 and revokes all tokens with valid refresh token cookie', async () => {
      const response = await request(app)
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .set('Cookie', userRefreshCookie);
      expect(response.status).toBe(200);
      const tokens = await prisma.refreshToken.findMany({ where: { userId: userId2 } });
      expect(tokens.length).toBe(0);
    });

    it('repeat call returns 200 (idempotent)', async () => {
      const response = await request(app)
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${userAccessToken}`);
      expect(response.status).toBe(200);
    });
  });

});