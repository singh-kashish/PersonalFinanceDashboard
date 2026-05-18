import { Request, Response } from "express"

const healthController = async (req:Request,res:Response) => {
        return res.status(200).json({status:"ok"})
}

export default healthController