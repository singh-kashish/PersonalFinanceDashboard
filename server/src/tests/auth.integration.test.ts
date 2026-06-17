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

});