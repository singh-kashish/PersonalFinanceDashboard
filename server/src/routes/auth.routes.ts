import express from 'express';

import {
  signupController,
  loginController,
  currentUserController,
  logoutController,
  refreshController,
  logoutAllController,
} from '../controllers/auth.controller';

import authMiddleware from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';

import {
  signupSchema,
  loginSchema,
} from '../validators/auth.validator';

import validate from '../middlewares/validate.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication APIs
 */


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       201:
 *         description: Signup successful
 *       409:
 *         description: User already exists
 *       400:
 *         description: Validation error
 */
router.post(
  '/auth/signup',
  authLimiter,
  validate(signupSchema, 'body'),
  signupController
);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login existing user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post(
  '/auth/login',
  authLimiter,
  validate(loginSchema, 'body'),
  loginController
);


/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 */
router.get(
  '/auth/me',
  authMiddleware,
  currentUserController
);


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
  '/auth/logout',
  authMiddleware,
  logoutController
);


/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/auth/refresh',
  authLimiter,
  refreshController
);

router.post(
  '/auth/logout-all',
  authMiddleware,
  logoutAllController
);

export default router;