const express = require('express')

const {signupController, loginController} = require('../controllers/auth.controller')

const router = express.Router();

router.post('/auth/signup',signupController);
router.post('/auth/login',loginController);

module.exports = router 

