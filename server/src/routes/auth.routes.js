const express = require('express')

const {signupController, loginController, currentUserController} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/auth/signup',signupController);
router.post('/auth/login',loginController);
router.get('/auth/me',authMiddleware,currentUserController)

module.exports = router 

