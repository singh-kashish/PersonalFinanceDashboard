const {createTransactionSchema,getTransactionsSchema, getTransactionSchema, updateTransactionSchema} = require('../validators/transaction.validator')

const {createTransactionService,getTransactionService,getTransactionsService, deleteTransactionService, updateTransactionService} = require('../services/transaction.service');

const postTransaction = async (req,res) =>{
    try{
        const parsedRequestBody = createTransactionSchema.safeParse(req.body)
        if(!parsedRequestBody.success){
            return res.status(400).json({message:parsedRequestBody.error.issues[0].message || 'Received Invalid Data'})
        }
        const userId = req.user.userId;
        const transaction = await createTransactionService(parsedRequestBody.data,userId)
        return res.status(201).json({transaction})
    } catch(error){
        
        return res.status(500).json({"error": {
            "message": error.message||"Internal Server Error"
        }})
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
        
        return res.status(500).json({"error": {
            "message": error.message||"Internal Server Error"
        }})
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
        return res.status(200).json({transactions});
    }catch(error){
        
        return res.status(500).json({"error": {
            "message": error.message||"Internal Server Error"
        }})
    }
}

const deleteTransaction = async(req,res) =>{
    try{
        const userId = req.user.userId;
        const transactionId = req.params.id
        const parsedTransactionId = getTransactionSchema.safeParse(transactionId);
        if(!parsedTransactionId.success){
            return res.status(400).json({message:parsedTransactionId.error.issues[0].message || 'Data error'})
        }
        const transaction = await deleteTransactionService(parsedTransactionId.data,userId);
        if(!transaction)return res.status(400).json({message: 'Issue'})
        return res.status(200).json({message:'Transaction deleted successfully'});
    } catch(error){
        return res.status(500).json({"error": {
            "message": error.message||"Internal Server Error"
        }})
    }
}

const updateTransaction = async(req,res)=>{
    try{
        const userId = req.user.userId;
        const parsedId = getTransactionSchema.safeParse(req.params.id)
        if(!parsedId.success)return res.status(400).json({message: parsedId.error.issues[0].message || 'Data issues'})
        const parsedBody = updateTransactionSchema.safeParse(req.body);
        if(!parsedBody.success)return res.status(400).json({message: parsedBody.error.issues[0].message || "Data issues"})
        const transaction = await updateTransactionService(parsedId.data,userId,parsedBody.data);
        if(!transaction) return res.status(400).json({message:'Error'})
        return res.status(200).json({transaction});
    } catch(error){
        
        return res.status(500).json({"error": {
            "message": error.message||"Internal Server Error"
        }})
    }
}

module.exports = {postTransaction,getTransactions,getTransaction, deleteTransaction, updateTransaction}