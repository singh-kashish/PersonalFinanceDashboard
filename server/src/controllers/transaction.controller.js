const {createTransactionSchema} = require('../validators/transaction.validator')

const {createTransactionService} = require('../services/transaction.service');

const postTransaction = async (req,res) =>{
    try{
        const parsedRequestBody = createTransactionSchema.safeParse(req.body)
        if(!parsedRequestBody.success){
            return res.status(400).json({message:parsedRequestBody.error.issues[0].message || 'Received Invalid Data'})
        }
        const userId = req.user.userId;
        const transaction = await createTransactionService(parsedRequestBody.data,userId)
        return res.status(201).json({message:'Transaction created successfully',transaction})
    } catch(error){
        return res.status(500).json({message:error.message || "Internal Server Error"})
    }
}

module.exports = {postTransaction}