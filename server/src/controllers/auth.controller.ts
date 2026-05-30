import { Request, Response, NextFunction } from 'express';

import {
  signupService,
  loginService,
} from '../services/auth.service';
import {
  SignUpInput,
  LoginInput,
} from '../validators/auth.validator';

import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { asyncHandler } from '../utils/asyncHandler';

const signupController = asyncHandler(async (
  req,res) => {
    // const validatedData =
    //   signupSchema.safeParse(req.body);

    // if (!validatedData.success) {
    //   throw new AppError(
    //     validatedData.error.issues[0]?.message ||
    //       'Validation error',
    //     400
    //   );
    // }

    // const result = await signupService(
    //   validatedData.data
    // );
    const result = await signupService(req.validated?.body as SignUpInput)
    sendSuccess(res,200,result,'Signup successful!')
});

const loginController = asyncHandler(async (
  req,
  res,
) => {
    const result = await loginService(req.validated?.body as LoginInput);
    sendSuccess(res,200,result,'Login Successful')
});

const currentUserController = asyncHandler(async (
  req,
  res
  )=> {
    sendSuccess(res,200,req.auth,'User details')
});

export {
  signupController,
  loginController,
  currentUserController,
};