import { NextFunction, Request, Response } from "express"

const healthController = async (req:Request,res:Response,next:NextFunction):Promise<void> => {
        try{
                res.status(200).json({status:"ok"})
        } catch(err:unknown){
                next(err)
        }
}

export default healthController