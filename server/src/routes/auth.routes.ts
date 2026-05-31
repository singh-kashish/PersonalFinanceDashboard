import express from 'express';

import {signupController, loginController, currentUserController,logoutController,refreshController} from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import {
  signupSchema,
  loginSchema,
} from '../validators/auth.validator';

import validate from '../middlewares/validate.middleware';
const router = express.Router();

router.post('/auth/signup',authLimiter,validate(signupSchema,'body'),signupController);
router.post('/auth/login',authLimiter,validate(loginSchema,'body'),loginController);
router.get('/auth/me',authMiddleware,currentUserController)
router.post('/auth/logout',logoutController)
router.post('/auth/refresh',authLimiter,refreshController)

export default router 

