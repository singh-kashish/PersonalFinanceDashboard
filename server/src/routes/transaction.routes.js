const express = require('express')

const {postTransaction} = require('../controllers/transaction.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router();

router.post('/transactions',authMiddleware,postTransaction);

module.exports = router