import bcrypt from 'bcryptjs';

import prisma from '../infra/prisma';

// import generateToken from '../utils/generateToken';

import {
  LoginInput,
  SignUpInput,
} from '../validators/auth.validator';

import AppError from '../utils/AppError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

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
  return prisma.refreshToken.create({
    data:{
      token,
      userId,
      expiresAt:new Date(
        Date.now() +
        7*24*60*60*1000
      ),
    }, 
  })
}

export const findRefreshToken =
async(token:string)=>{

  return prisma.refreshToken.findUnique({
    where:{
      token,
    },
  });

};

export const deleteRefreshToken =
async(token:string)=>{

  return prisma.refreshToken.deleteMany({
    where:{
      token,
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



export {
  signupService,
  loginService,
};