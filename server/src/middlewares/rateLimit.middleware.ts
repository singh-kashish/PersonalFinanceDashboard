import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isTest = env.NODE_ENV === 'test';

export const authLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 1000 : 20,
    message: {
      success: false,
      message: 'Too many requests'
    }
  });

export const globalLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 5000 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.'
    }
  });
