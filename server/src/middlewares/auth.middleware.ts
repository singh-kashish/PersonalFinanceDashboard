import { NextFunction, Request, Response }
from "express";

import jwt from "jsonwebtoken";

import AppError from "../utils/AppError";

import {
  jwtPayloadSchema,
} from "../validators/auth.validator";

import { env } from "../config/env";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "Access denied. No token provided.",
        401
      );
    }

    const [scheme, token] =
      authHeader.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      throw new AppError(
        "Invalid authorization header format.",
        401
      );
    }

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    const validatedPayload =
      jwtPayloadSchema.safeParse(decoded);

    if (!validatedPayload.success) {
      throw new AppError(
        "Invalid token payload.",
        401
      );
    }

    req.auth = validatedPayload.data;

    next();
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError(
            "Invalid or expired token.",
            401
          )
    );
  }
};

export default authMiddleware;