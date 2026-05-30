import { Request, Response,NextFunction } from "express"
import { AnalyticsQueryInput } from "../validators/analytics.validator";
import AppError from "../utils/AppError";
import { summaryService,categoryService, monthlyService } from "../services/analytics.service";
import { sendSuccess } from "../utils/sendSuccess";
import { asyncHandler } from "../utils/asyncHandler";
//Summary
export const summaryController = asyncHandler(async (req,res) =>{
        let result = await summaryService(req.validated?.query as AnalyticsQueryInput,req.auth.userId);
        sendSuccess(res,200,result,'Received Summary');
})
//Category
export const categoryController = asyncHandler(async (req,res) =>{
        let result = await categoryService(req.validated?.query as AnalyticsQueryInput,req.auth.userId);
        sendSuccess(res,200,result,'Received Category data')
});
//Monthly
export const monthlyController = asyncHandler(async(req,res)=>{
        let result = await monthlyService(req.validated?.query as AnalyticsQueryInput,req.auth.userId);
        sendSuccess(res,200,result,'Received Monthly statistics')
})