const express = require('express')

const {postTransaction, getTransactions, getTransaction} = require('../controllers/transaction.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router();

router.post('/transactions',authMiddleware,postTransaction);
router.get('/transactions',authMiddleware,getTransactions);
router.get('/transactions/:id',authMiddleware,getTransaction);

module.exports = router