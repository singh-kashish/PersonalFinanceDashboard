import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  statusCode: number,
  data: unknown,
  message?: string
): void => {
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
};