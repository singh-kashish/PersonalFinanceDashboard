import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { jwtPayloadSchema } from "../validators/auth.validator";
import { verifyAccessToken } from "../utils/jwt";

{/* Validates a Bearer access token and attaches a typed `req.auth` payload.
 Logs specifics server-side but returns a generic error to the client.*/}
const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn(
      `[authMiddleware] requestId=${req.requestId} missing Authorization header`
    );
    return next(new AppError("Invalid or expired token", 401));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    console.warn(
      `[authMiddleware] requestId=${req.requestId} malformed Authorization header: ${authHeader}`
    );
    return next(new AppError("Invalid or expired token", 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    const validated = jwtPayloadSchema.parse(decoded);

    req.auth = validated;
    return next();
  } catch (err) {

    console.warn(
      `[authMiddleware] requestId=${req.requestId} invalid or expired JWT`,
      err
    );

    if (err instanceof AppError) {
      return next(err);
    }

    return next(new AppError("Invalid or expired token", 401));
  }
};

export default authMiddleware;
