import { Request, Response, NextFunction } from 'express';

import {
  signupService,
  loginService,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} from '../services/auth.service';
import {
  SignUpInput,
  LoginInput,
} from '../validators/auth.validator';

import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { asyncHandler } from '../utils/asyncHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const signupController = asyncHandler(async (
  req,res) => {
 const user =
 await signupService(
   req.validated?.body as SignUpInput
 );

const accessToken =
 generateAccessToken({
    userId:user.id,
    email:user.email
 });

const refreshToken =
 generateRefreshToken({
    userId:user.id,
    email:user.email
 });
 await createRefreshToken(refreshToken,user.id);

res.cookie(
  'refreshToken',
  refreshToken,
  {
    httpOnly:true,
    secure:
      process.env.NODE_ENV ===
      'production',
    sameSite:'strict',
    maxAge:
      7*24*60*60*1000
  }
);

sendSuccess(
  res,
  201,
  {
      accessToken,
      user,
  },
  'Signup successful!'
);
});

const loginController = asyncHandler(async (
  req,
  res,
) => {
    const user = await loginService(req.validated?.body as LoginInput);
    
    const refreshToken = generateRefreshToken({
    userId:user.id,
    email:user.email
 });
 const accessToken = generateAccessToken({
  userId: user.id,
  email:user.email
 });

 await createRefreshToken(
  refreshToken,
  user.id
);

res.cookie(
   'refreshToken',
   refreshToken,
   {
      httpOnly:true,
      secure:
        process.env.NODE_ENV ===
        'production',

      sameSite:'strict',

      maxAge:
        7*24*60*60*1000
   }
);
sendSuccess(
  res,
  200,
  {
    accessToken,
    user,
  },
  'Login Successful'
);
});

const currentUserController = asyncHandler(async (
  req,
  res
  )=> {
    sendSuccess(res,200,req.auth,'User details')
});

export const refreshController =
asyncHandler(async(req,res)=>{

    const refreshToken =
      req.cookies.refreshToken;

    if(!refreshToken){

      throw new AppError(
        'No refresh token',
        401
      );

    }

    const payload =
      verifyRefreshToken(
        refreshToken
      );

    const existingToken =
      await findRefreshToken(
        refreshToken
      );

    if(!existingToken){

      throw new AppError(
        'Invalid session',
        401
      );

    }

    if(
      existingToken.expiresAt <
      new Date()
    ){

      throw new AppError(
        'Session expired',
        401
      );

    }

    await deleteRefreshToken(
      refreshToken
    );

    const newRefreshToken =
      generateRefreshToken({
          userId:payload.userId,
          email:payload.email
      });

    await createRefreshToken(
      newRefreshToken,
      payload.userId
    );

    const accessToken =
      generateAccessToken({
          userId:payload.userId,
          email:payload.email
      });

    res.cookie(
      'refreshToken',
      newRefreshToken,
      {
        httpOnly:true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite:'strict',
        maxAge:
          7*24*60*60*1000
      }
    );

    sendSuccess(
      res,
      200,
      {accessToken},
      'Token refreshed'
    );

});

export const logoutController =
asyncHandler(async(req,res)=>{

    const refreshToken =
      req.cookies.refreshToken;

    if(refreshToken){

      await deleteRefreshToken(
        refreshToken
      );

    }

    res.clearCookie(
      'refreshToken',
      {
        httpOnly:true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite:'strict'
      }
    );

    sendSuccess(
      res,
      200,
      null,
      'Logged out'
    );

});

export {
  signupController,
  loginController,
  currentUserController,
};