const z = require('zod');

const transactionTypes = [
    'INCOME',
    'EXPENSE',
];

const createTransactionSchema = z.object({
    amount: z.coerce
        .number()
        .positive('Amount must be greater than 0'),

    type: z.enum(transactionTypes),

    category: z.string()
        .trim()
        .min(1, 'Category is required'),

    description: z.string()
        .trim()
        .max(300, 'Description too long')
        .optional(),

    date: z.string()
        .datetime()
        .optional(),
});

const getTransactionsSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(10),

    category: z.string()
        .trim()
        .optional(),

    sortBy: z.enum([
        'amount',
        'category',
        'type',
        'date',
        'createdAt',
        'updatedAt',
    ]).default('createdAt'),

    order: z.enum([
        'asc',
        'desc',
    ]).default('desc'),

    type: z.enum(transactionTypes)
        .optional(),
});

const transactionIdSchema = z.coerce
    .number()
    .int()
    .positive('Invalid transaction id');

const updateTransactionSchema = z.object({
    amount: z.coerce
        .number()
        .positive()
        .optional(),

    type: z.enum(transactionTypes)
        .optional(),

    category: z.string()
        .trim()
        .min(1)
        .optional(),

    description: z.string()
        .trim()
        .max(300)
        .optional(),

    date: z.string()
        .datetime()
        .optional(),
}).refine(
    (data) =>
        Object.keys(data).length > 0,
    {
        message:
            'At least one field must be provided',
    }
);

module.exports = {
    createTransactionSchema,
    getTransactionsSchema,
    transactionIdSchema,
    updateTransactionSchema,
};