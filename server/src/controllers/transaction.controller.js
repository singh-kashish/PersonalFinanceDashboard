const {
    createTransactionSchema,
    getTransactionsSchema,
    transactionIdSchema,
    updateTransactionSchema,
} = require('../validators/transaction.validator');

const {
    createTransactionService,
    getTransactionService,
    getTransactionsService,
    updateTransactionService,
    deleteTransactionService,
} = require('../services/transaction.service');

const AppError = require('../utils/AppError');

const postTransaction = async (
    req,
    res,
    next
) => {
    try {
        const parsedBody =
            createTransactionSchema.safeParse(
                req.body
            );

        if (!parsedBody.success) {
            throw new AppError(
                parsedBody.error.issues[0]
                    .message,
                400
            );
        }

        const transaction =
            await createTransactionService(
                parsedBody.data,
                req.auth.userId
            );

        return res.status(201).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

const getTransaction = async (
    req,
    res,
    next
) => {
    try {
        const parsedId =
            transactionIdSchema.safeParse(
                req.params.id
            );

        if (!parsedId.success) {
            throw new AppError(
                parsedId.error.issues[0]
                    .message,
                400
            );
        }

        const transaction =
            await getTransactionService(
                parsedId.data,
                req.auth.userId
            );

        return res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (
    req,
    res,
    next
) => {
    try {
        const parsedQuery =
            getTransactionsSchema.safeParse(
                req.query
            );

        if (!parsedQuery.success) {
            throw new AppError(
                parsedQuery.error.issues[0]
                    .message,
                400
            );
        }

        const transactions =
            await getTransactionsService(
                parsedQuery.data,
                req.auth.userId
            );

        return res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        next(error);
    }
};

const updateTransaction = async (
    req,
    res,
    next
) => {
    try {
        const parsedId =
            transactionIdSchema.safeParse(
                req.params.id
            );

        if (!parsedId.success) {
            throw new AppError(
                parsedId.error.issues[0]
                    .message,
                400
            );
        }

        const parsedBody =
            updateTransactionSchema.safeParse(
                req.body
            );

        if (!parsedBody.success) {
            throw new AppError(
                parsedBody.error.issues[0]
                    .message,
                400
            );
        }

        const updatedTransaction =
            await updateTransactionService(
                parsedId.data,
                req.auth.userId,
                parsedBody.data
            );

        return res.status(200).json({
            success: true,
            data: updatedTransaction,
        });
    } catch (error) {
        next(error);
    }
};

const deleteTransaction = async (
    req,
    res,
    next
) => {
    try {
        const parsedId =
            transactionIdSchema.safeParse(
                req.params.id
            );

        if (!parsedId.success) {
            throw new AppError(
                parsedId.error.issues[0]
                    .message,
                400
            );
        }

        await deleteTransactionService(
            parsedId.data,
            req.auth.userId
        );

        return res.status(200).json({
            success: true,
            message:
                'Transaction deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    postTransaction,
    getTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
};