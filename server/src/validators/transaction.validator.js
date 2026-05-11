const z = require('zod')

const transactionTypes = ["INCOME","EXPENSE"];

const createTransactionSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    type:z.enum(transactionTypes),
    category: z.string().trim().min(1,"Category is required"),
    description: z.string().trim().max(300,"Description too long").optional(),
    date: z.string().datetime().optional(),
})

const getTransactionsSchema = z.object({
    page:z.coerce.number().int().positive("Page number must be positive").default(1),
    limit:z.coerce.number().positive("Page limit must be positive").max(100).default(10),
    category:z.string().trim().optional(),
    sortBy:z.enum(['type','category','date','createdAt','updatedAt','amount']).default('createdAt'),
    order:z.enum(['asc','desc']).default('desc'),
    type:z.enum(transactionTypes).optional()
})

const getTransactionSchema = z.coerce.number().int().positive("Invalid transaction id");

const updateTransactionSchema = z.object({
    amount: z.coerce.number().positive().optional(),
    type: z.enum(transactionTypes).optional(),
    category: z.string().trim().min(1).optional(),
    description: z.string().trim().max(300).optional(),
    date: z.string().datetime().optional()
}).refine((data)=>{
    return (
        data.amount!==undefined || 
        data.type!==undefined ||
        data.category!==undefined||
        data.description!==undefined||
        data.date!==undefined
    )
},{
      message: "At least one field must be provided",
      path: [], 
    })

module.exports = {createTransactionSchema, getTransactionsSchema, getTransactionSchema, updateTransactionSchema}