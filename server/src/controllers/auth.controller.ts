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

const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
  try {
    // const parsedBody =
    //   loginSchema.safeParse(req.body);

    // if (!parsedBody.success) {
    //   throw new AppError(
    //     parsedBody.error.issues[0]?.message ||
    //       'Validation error',
    //     400
    //   );
    // }

    // const result = await loginService(
    //   parsedBody.data
    // );
    const result = await loginService(req.validated?.body as LoginInput);
    sendSuccess(res,200,result,'Login Successful')
  } catch (error) {
    next(error);
  }
};

const currentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
  try {
    sendSuccess(res,200,req.auth,'User details')
  } catch (error) {
    next(error);
  }
};

export {
  signupController,
  loginController,
  currentUserController,
};