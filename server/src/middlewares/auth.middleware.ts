import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
//import { JwtPayload } from "../types/auth.types";
import AppError from "../utils/AppError";
import { jwtPayloadSchema } from "../validators/auth.validator"; 
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "Access denied. No token provided.",
        401
      );
    }

    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      throw new AppError(
        "Invalid authorization header format.",
        401
      );
    }

    const token = parts[1];

    // const decoded = jwt.verify(
    //   token,
    //   process.env.JWT_SECRET as string
    // ) as unknown as JwtPayload;

    const decoded = jwt.verify(token,process.env.JWT_SECRET!);
    const validatedPayload = jwtPayloadSchema.safeParse(decoded);
    if(!validatedPayload.success){
      throw new AppError( "Invalid token payload",
      401)
    }
    req.user = validatedPayload.data;

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