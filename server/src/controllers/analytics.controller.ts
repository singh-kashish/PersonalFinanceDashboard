import { Request, Response,NextFunction } from "express"
import { analyticsQuerySchema } from "../validators/analytics.validator"
import AppError from "../utils/AppError";
import { summaryService,categoryService, monthlyService } from "../services/analytics.service";
//Summary
export const summaryController = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        let parsedParams = analyticsQuerySchema.safeParse(req.query);
        if(!parsedParams.success){
            throw new AppError(parsedParams.error.issues[0]?.message??'Issue with params',400)
        }
        let result = await summaryService(parsedParams.data,req.auth.userId);
        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch(error){
        next(error)
    }
}
//Category
export const categoryController = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        let parsedParams = analyticsQuerySchema.safeParse(req.query);
        if(!parsedParams.success){
            throw new AppError(parsedParams.error.issues[0]?.message??'Issue with params',400)
        }
        let result = await categoryService(parsedParams.data,req.auth.userId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch(error){
        next(error)
    }
}
//Monthly
export const monthlyController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        let parsedParams = analyticsQuerySchema.safeParse(req.query);
        if(!parsedParams.success){
            throw new AppError(parsedParams.error.issues[0]?.message??'Issue with params',400)
        }
        let result = await monthlyService(parsedParams.data,req.auth.userId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch(error){
        next(error)
    }
}