import request from "supertest"
import app from '../app'
import prisma from "../lib/prisma";
import { Prisma } from "../generated/prisma/browser";
import AppError from "../utils/AppError";

{/*Test signup:

POST /auth/signup

✓ creates user
✓ returns access token
✓ sets refresh cookie
✓ stores refresh token in DB
✓ duplicate email returns 409
*/}
describe("POST /auth/signup",()=>{
    const payload = {email:"jest@jest.com",password:"tester101"};
    it("creates user, returns access token and sets cookie",async ()=>{
        const response = await request(app).post('/auth/signup').send(payload)
        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.accessToken).toBeDefined()
        expect(response.headers['set-cookie']).toBeDefined()
    })
    it('signup was successful, user exists in db and user has refresh token in refreshToken table',async ()=>{
        const user = await prisma.user.findUnique({
            where:{
                email:payload.email
            }
        })
        expect(user).toBeDefined();
        if(!user)throw new AppError('User not created',401)
        const refreshToken = await prisma.refreshToken.findFirst({
            where:{
                userId: user.id
            }
        })
        expect(refreshToken).toBeDefined()
    })
    it('duplicate email should return 409 and smaller password should return 400(zod error)',async ()=>{
        const newUser = await request(app).post('/auth/signup').send({email:payload.email,password:'290389023'});
        expect(newUser.statusCode).toBe(409)
        const anotherUser = await request(app).post('/auth/signup').send({email:'alphazod@gmail.com',password:'123'})
        console.log(anotherUser)
        expect(anotherUser.statusCode).toBe(400)        
    })
})
{/*
Test login:

POST /auth/login

✓ valid credentials login
✓ invalid email returns 401
✓ invalid password returns 401
✓ refresh token stored
*/}
{/*
Test current user:

GET /auth/me

✓ valid access token returns user
✓ missing token returns 401
✓ invalid token returns 401
*/}
{/*
Test refresh:

POST /auth/refresh

✓ valid refresh cookie returns access token
✓ rotates refresh token
✓ old refresh token deleted
✓ invalid cookie returns 401
✓ expired token returns 401
*/}
{/*
Test logout:

POST /auth/logout

✓ clears cookie
✓ deletes refresh token from DB
✓ multiple logout calls still succeed
*/}
{/*
Then add auth flow tests (these are very good interview material):

Signup
↓
Login
↓
Access protected route
↓
Refresh token
↓
Access route again
↓
Logout
↓
Refresh fails
*/}
{/*
Then add rate-limiter tests:

✓ >20 login requests blocked

Then validation tests:

✓ invalid email
✓ password too short
✓ malformed payload
*/}