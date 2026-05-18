import { Request, Response, NextFunction } from 'express';

import {
  signupSchema,
  loginSchema,
} from '../validators/auth.validator';

import {
  signupService,
  loginService,
} from '../services/auth.service';

import AppError from '../utils/AppError';

const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData =
      signupSchema.safeParse(req.body);

    if (!validatedData.success) {
      throw new AppError(
        validatedData.error.issues[0]?.message ||
          'Validation error',
        400
      );
    }

    const result = await signupService(
      validatedData.data
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody =
      loginSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ||
          'Validation error',
        400
      );
    }

    const result = await loginService(
      parsedBody.data
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const currentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.auth,
    });
  } catch (error) {
    next(error);
  }
};

export {
  signupController,
  loginController,
  currentUserController,
};