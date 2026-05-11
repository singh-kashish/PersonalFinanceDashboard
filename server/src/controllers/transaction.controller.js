const {createTransactionSchema,getTransactionsSchema, getTransactionSchema} = require('../validators/transaction.validator')

const {createTransactionService,getTransactionService,getTransactionsService} = require('../services/transaction.service');

const postTransaction = async (req,res) =>{
    try{
        const parsedRequestBody = createTransactionSchema.safeParse(req.body)
        if(!parsedRequestBody.success){
            return res.status(400).json({message:parsedRequestBody.error.issues[0].message || 'Received Invalid Data'})
        }
        const userId = req.user.userId;
        const transaction = await createTransactionService(parsedRequestBody.data,userId)
        if(!transaction)return res.status(404).json({message:'Internal Server Error'})
        return res.status(201).json({transaction})
    } catch(error){
        return res.status(500).json({message:error.message || "Internal Server Error"})
    }
}

const getTransaction = async(req,res)=>{
    try{
        const userId = req.user.userId;
        const transactionId = req.params.id;
        const parsedId = getTransactionSchema.safeParse(transactionId);
        if(!parsedId.success){
            return res.status(400).json({message:parsedId.error.issues[0].message || 'Received Invalid Data'})
        }
        const transaction = await getTransactionService(parsedId.data,userId);
        if(!transaction)return res.status(404).json({message:'Not found'})
        return res.status(200).json({transaction})
    } catch(error){
        res.status(500).json({message:error.message || "Internal Server Error"})
    }
    
}

const getTransactions = async(req,res) =>{
    try{
        const userId = req.user.userId;
        const parsedQueries = getTransactionsSchema.safeParse(req.query);
        if(!parsedQueries.success){
            return res.status(400).json({message:parsedQueries.error.issues[0].message || "Received Invalid Parameters"})
        }
        const transactions = await getTransactionsService(parsedQueries.data,userId);
        if(!transactions)return res.status(404).json({message:'Not found'})
        return res.status(200).json({message:'Transactions received',transactions});
    }catch(error){
        return res.status(500).json({message:error.message || "Internal Server Error"})
    }
}

module.exports = {postTransaction,getTransactions,getTransaction}