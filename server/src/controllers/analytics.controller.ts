import { Request, Response,NextFunction } from "express"
import { AnalyticsQueryInput } from "../validators/analytics.validator";
import AppError from "../utils/AppError";
import { summaryService,categoryService, monthlyService } from "../services/analytics.service";
import { sendSuccess } from "../utils/sendSuccess";
//Summary
export const summaryController = async (req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
        let result = await summaryService(req.validated?.query as AnalyticsQueryInput,req.auth.userId);
        sendSuccess(res,200,result,'Received Summary');
    } catch(error){
        next(error)
    }
}
//Category
export const categoryController = async (req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
        let result = await categoryService(req.validated?.query as AnalyticsQueryInput,req.auth.userId);
        sendSuccess(res,200,result,'Received Category data')
    } catch(error){
        next(error)
    }
}
//Monthly
export const monthlyController = async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        let result = await monthlyService(req.validated?.query as AnalyticsQueryInput,req.auth.userId);
        sendSuccess(res,200,result,'Received Monthly statistics')
    } catch(error){
        next(error)
    }
}