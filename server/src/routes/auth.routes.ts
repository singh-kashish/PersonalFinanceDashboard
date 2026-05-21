import express from 'express';

import {signupController, loginController, currentUserController} from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

import {
  signupSchema,
  loginSchema,
} from '../validators/auth.validator';

import validate from '../middlewares/validate.middleware';
const router = express.Router();

router.post('/auth/signup',validate(signupSchema,'body'),signupController);
router.post('/auth/login',validate(loginSchema,'body'),loginController);
router.get('/auth/me',authMiddleware,currentUserController)

export default router 

