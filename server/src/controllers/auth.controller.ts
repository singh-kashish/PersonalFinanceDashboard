import { Request, Response, NextFunction } from 'express';

import {
  signupService,
  loginService,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  refreshTokenTransaction,
  deleteAllRefreshTokens
} from '../services/auth.service';
import {
  SignUpInput,
  LoginInput,
} from '../validators/auth.validator';

import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { asyncHandler } from '../utils/asyncHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { refreshCookieOptions, refreshCookieSignoutOptions } from '../utils/CookieOptions';

const signupController = asyncHandler(async (
  req,res) => {
 const user =
 await signupService(
   req.validated?.body as SignUpInput
 );

const accessToken = generateAccessToken({userId:user.id,email:user.email});

const refreshToken = generateRefreshToken({userId:user.id,email:user.email});
 await createRefreshToken(refreshToken,user.id);

res.cookie('refreshToken',refreshToken,
  refreshCookieOptions
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
   refreshCookieOptions
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
    res.set("Cache-Control", "no-store");
    sendSuccess(res,200,req.auth,'User details')
});

export const refreshController =
asyncHandler(async(req,res)=>{

    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
      throw new AppError('No refresh token',401);
    }
    const payload = verifyRefreshToken(refreshToken);
    const {accessToken,refreshToken:newRefreshToken} = await refreshTokenTransaction(refreshToken);
    res.cookie(
      'refreshToken',
      newRefreshToken,
      refreshCookieOptions
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
      refreshCookieSignoutOptions
    );

    sendSuccess(
      res,
      200,
      null,
      'Logged out'
    );

});

export const logoutAllController = asyncHandler(async(req:Request,res:Response)=>{
  const userId = req.auth.userId;
  const refreshToken = req.cookies["refreshToken"];
  if(refreshToken){
    const deleted = await deleteAllRefreshTokens(userId);
    if(deleted.count<=0)throw new AppError("Server issue",400);
    res.clearCookie(
      'refreshToken',
      refreshCookieSignoutOptions
    );
    sendSuccess(res,200,null,"Logged out");
  }
})

export {
  signupController,
  loginController,
  currentUserController,
};