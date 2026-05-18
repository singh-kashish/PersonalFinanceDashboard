import express from 'express';

import {signupController, loginController, currentUserController} from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/auth/signup',signupController);
router.post('/auth/login',loginController);
router.get('/auth/me',authMiddleware,currentUserController)

export default router 

