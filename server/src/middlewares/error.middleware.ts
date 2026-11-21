// middlewares/error.middleware.ts

import {
  Request,
  Response,
  NextFunction,
} from 'express';

import { ZodError } from 'zod';

import AppError from '../utils/AppError';

const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {

  console.error(err);

  let statusCode = 500;
  let message = 'Internal server error';

  if(err instanceof AppError){

    statusCode = err.statusCode;
    message = err.message;

  } else if(err instanceof ZodError){

    statusCode = 400;
    message = err.issues[0]?.message ?? 'Validation Error';

  } else if(err instanceof Error){
    // Unexpected error - log server-side, return generic message in production
    if (process.env.NODE_ENV === 'development') {
      message = err.message;
    } else {
      message = `Internal server error (requestId: ${req.requestId})`;
    }
  }

  res.status(statusCode).json({
    success:false,
    message,
  });

};

export default errorMiddleware;