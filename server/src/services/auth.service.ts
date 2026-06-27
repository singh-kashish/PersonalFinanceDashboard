import bcrypt from 'bcryptjs';

import prisma from '../infra/prisma';

// import generateToken from '../utils/generateToken';

import {
  LoginInput,
  SignUpInput,
} from '../validators/auth.validator';

import AppError from '../utils/AppError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { hashToken,MAX_REFRESH_TOKENS, REFRESH_TOKEN_EXPIRATION_DURATION } from '../utils/hashToken';


const signupService = async ({
  email,
  name,
  password,
}: SignUpInput) => {
  const existingUser =
    await prisma.user.findUnique({
      where: { email },
    });

  if (existingUser) {
    throw new AppError(
      'User already exists',
      409
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,

      ...(name !== undefined && {
        name,
      }),
    },
  });

  return {
      id: user.id,
      email: user.email,
      name: user.name,
  };
};

const loginService = async ({
  email,
  password,
}: LoginInput) => {
  const existingUser =
    await prisma.user.findUnique({
      where: { email },
    });

  if (!existingUser) {
    throw new AppError(
      'Invalid credentials',
      401
    );
  }

  const isCorrectPassword =
    await bcrypt.compare(
      password,
      existingUser.password
    );

  if (!isCorrectPassword) {
    throw new AppError(
      'Invalid credentials',
      401
    );
  }

  return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    };
};

export const createRefreshToken = (token:string,userId:number)=>{
  const hashedToken = hashToken(token);
  return prisma.refreshToken.create({
    data:{
      token:hashedToken,
      userId,
      expiresAt:new Date(
        Date.now() +
        REFRESH_TOKEN_EXPIRATION_DURATION
      ),
    }, 
  })
}

export const findRefreshToken =
async(token:string)=>{
  const hashedToken = hashToken(token);
  return prisma.refreshToken.findUnique({
    where:{
      token:hashedToken,
    },
  });

};

export const deleteRefreshToken =
async(token:string)=>{
  const hashedToken = hashToken(token);
  return prisma.refreshToken.deleteMany({
    where:{
      token:hashedToken,
    },
  });

};

export const deleteAllRefreshTokens =
async(userId:number)=>{
  return prisma.refreshToken.deleteMany({
    where:{
      userId,
    },
  });
};

// Refresh rotation: one transaction to enforce one-time use,
// clean up expired tokens, cap sessions at MAX_REFRESH_TOKENS,
// and insert a new hashed refresh token.
export const refreshTokenTransaction = async(token:string)=>{
  const {accessToken,refreshToken} = await prisma.$transaction(async (tx)=>{
    const prevHashedToken = hashToken(token);
    const exists = await tx.refreshToken.findUnique({
        where: { token:prevHashedToken },
      });
    if(!exists){
      throw new AppError("Invalid session",401);
    }
    if(exists.expiresAt<=new Date()){
      throw new AppError("Session expired",401)
    }
    const userId = exists.userId;
    const user = await tx.user.findFirst({where:{id:userId}});
    // Delete the presented token. If nothing was deleted, another request consumed it first.
    const deleted = await tx.refreshToken.deleteMany({where:{token:prevHashedToken}});
    if(deleted.count===0 || !user){
      throw new AppError("Invalid Session",401);
    }
    // Remove all other expired tokens for this user on every refresh.
    await tx.refreshToken.deleteMany({
      where:{
        userId,
        expiresAt: {lte:new Date()},
      }
    });
    // Keep at most MAX_REFRESH_TOKENS - 1 existing tokens before adding the new one.
    const existingTokens = await tx.refreshToken.findMany({
      where: {userId},
      orderBy: {createdAt:"asc"}
    });
    const tokensToDrop = existingTokens.length - (MAX_REFRESH_TOKENS-1);
    if(tokensToDrop>0){
      const idsToDrop = existingTokens.slice(0,tokensToDrop).map((i)=>i.id);
      await tx.refreshToken.deleteMany({where:{id:{in:idsToDrop}}})
    }
    const payload = {
      userId,
      email:user.email
    }
    const refreshToken = generateRefreshToken(payload);
    const accessToken = generateAccessToken(payload);
    // await createRefreshToken(refreshToken,userId); --> Foot - gun
    const hashed = hashToken(refreshToken);
    await tx.refreshToken.create({
      data:{
        token: hashed,
        userId,
        expiresAt: new Date(Date.now()+ REFRESH_TOKEN_EXPIRATION_DURATION),
        createdAt: new Date()
      }
    })
    return {accessToken,refreshToken};
  })
  return {accessToken,refreshToken};
}



export {
  signupService,
  loginService,

};