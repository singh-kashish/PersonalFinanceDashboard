const z = require('zod')

const createTransactionSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    type:z.enum(["INCOME","EXPENSE"]),
    category: z.string().trim().min(1,"Category is required"),
    description: z.string().trim().optional(),
    date: z.string().datetime().optional(),
})

module.exports = {createTransactionSchema}