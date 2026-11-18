import request from 'supertest';
import app from '../app';

describe(
  'Auth validation tests',
()=>{

  it(
    'invalid email returns 400',
    async()=>{

      const response =
        await request(app)
          .post('/auth/signup')
          .send({
            email:'bademail',
            password:'tester101'
          });

      expect(
        response.status
      ).toBe(400);

    }
  );

  it(
    'short password returns 400',
    async()=>{

      const response =
        await request(app)
          .post('/auth/signup')
          .send({
            email:'short@gmail.com',
            password:'123'
          });

      expect(
        response.status
      ).toBe(400);

    }
  );

  it(
    'missing payload returns 400',
    async()=>{

      const response =
        await request(app)
          .post('/auth/signup')
          .send({});

      expect(
        response.status
      ).toBe(400);

    }
  );

  it(
    'duplicate email returns 409',
    async()=>{

      const payload = {
        email:
        `duplicate${Date.now()}@gmail.com`,
        password:
        'tester101'
      };

      await request(app)
        .post('/auth/signup')
        .send(payload);

      const response =
        await request(app)
          .post('/auth/signup')
          .send(payload);

      expect(
        response.status
      ).toBe(409);

    }
  );

});