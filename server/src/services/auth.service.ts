import bcrypt from 'bcryptjs';

import prisma from '../lib/prisma';

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

  // const accessToken = generateAccessToken({
  //   userId: user.id,
  //   email: user.email,
  // });

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
  const payload = {
    userId: existingUser.id,
    email: existingUser.email,
  }
  const accessToken = generateAccessToken(payload);
  // const token = generateToken({
  //   userId: existingUser.id,
  //   email: existingUser.email,
  // }); <--- Not returning this token now.

  return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    };
};

export {
  signupService,
  loginService,
};