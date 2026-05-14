const express = require('express');

const {
    postTransaction,
    getTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
} = require('../controllers/transaction.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post(
    '/transactions',
    postTransaction
);

router.get(
    '/transactions',
    getTransactions
);

router.get(
    '/transactions/:id',
    getTransaction
);

router.patch(
    '/transactions/:id',
    updateTransaction
);

router.delete(
    '/transactions/:id',
    deleteTransaction
);

module.exports = router;