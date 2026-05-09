const prisma = require('../lib/prisma');

const createTransactionService = async (transactionData,userId) =>{
    const transaction = await prisma.transaction.create({
        data:{
            ...transactionData,
            userId
        }
    });
    return transaction;
    
}

module.exports = {createTransactionService}