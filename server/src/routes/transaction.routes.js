const express = require('express')

const {postTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction} = require('../controllers/transaction.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router();

router.post('/transactions',authMiddleware,postTransaction);
router.get('/transactions',authMiddleware,getTransactions);
router.get('/transactions/:id',authMiddleware,getTransaction);
router.patch('/transactions/:id',authMiddleware,updateTransaction);
router.delete('/transactions/:id',authMiddleware,deleteTransaction);

module.exports = router