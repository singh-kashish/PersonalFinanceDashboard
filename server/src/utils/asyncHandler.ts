// utils/asyncHandler.ts
// a higher-order function/middleware factory (Function Middleware returning a RequestHandler)
// Request Handler === (req,res,next)

import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

export const asyncHandler = (
  fn: RequestHandler
): RequestHandler => {

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    Promise.resolve(
      fn(req,res,next)
    ).catch(next);

  };
};

// Benifits: -
/*
Reliability: async errors always reach your error middleware, no forgotten try/catch
Maintainability: one place to evolve error/logging behavior.
Readability: route handlers focus on what they do, not how async control flow is wired.
Bug reduction: fewer subtle mistakes with next, partial responses, or unhandled rejections.
*/