const prisma = require('../lib/prisma');

const AppError = require('../utils/AppError');

const createTransactionService = async (
    transactionData,
    userId
) => {
    return prisma.transaction.create({
        data: {
            ...transactionData,

            userId,

            date: transactionData.date
                ? new Date(transactionData.date)
                : new Date(),
        },
    });
};

const getTransactionService = async (
    transactionId,
    userId
) => {
    const transaction =
        await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
            },
        });

    if (!transaction) {
        throw new AppError(
            'Transaction not found.',
            404
        );
    }

    return transaction;
};

const getTransactionsService = async (
    parameters,
    userId
) => {
    const {
        page,
        limit,
        category,
        sortBy,
        order,
        type,
    } = parameters;

    const where = {
        userId,
    };

    if (category) {
        where.category = category;
    }

    if (type) {
        where.type = type;
    }

    const skip = (page - 1) * limit;

    const [transactions, total] =
        await Promise.all([
            prisma.transaction.findMany({
                where,

                orderBy: {
                    [sortBy]: order,
                },

                skip,

                take: limit,
            }),

            prisma.transaction.count({
                where,
            }),
        ]);

    return {
        transactions,

        pagination: {
            total,
            page,
            limit,

            pages: Math.ceil(
                total / limit
            ),
        },
    };
};

const updateTransactionService = async (
    transactionId,
    userId,
    updateData
) => {
    const existingTransaction =
        await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
            },
        });

    if (!existingTransaction) {
        throw new AppError(
            'Transaction not found.',
            404
        );
    }

    return prisma.transaction.update({
        where: {
            id: transactionId,
        },

        data: {
            ...updateData,

            ...(updateData.date && {
                date: new Date(updateData.date),
            }),
        },
    });
};

const deleteTransactionService = async (
    transactionId,
    userId
) => {
    const existingTransaction =
        await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
            },
        });

    if (!existingTransaction) {
        throw new AppError(
            'Transaction not found.',
            404
        );
    }

    await prisma.transaction.delete({
        where: {
            id: transactionId,
        },
    });

    return true;
};

module.exports = {
    createTransactionService,
    getTransactionService,
    getTransactionsService,
    updateTransactionService,
    deleteTransactionService,
};