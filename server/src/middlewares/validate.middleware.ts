import { NextFunction, Request, Response, RequestHandler } from "express";
import {  z, infer as zInfer } from "zod"
import AppError from "../utils/AppError";
// Middleware Factory(Returning middleware with specific configuration)
type Source = 'params' | 'body' | 'query'
// _res( '_'->denotes unused parameter )
export default function validate<T extends z.ZodType>(schema:T,source:Source) : RequestHandler{
    return (req:Request,_res:Response,next:NextFunction) =>{
        const parsedValue = schema.safeParse(req[source]);
        if(!parsedValue.success){
            return next(new AppError(parsedValue.error.issues[0]?.message ?? "Internal Server Error",400))
        }
        if(!req.validated){
            req.validated={};
        }
        req.validated[source as Source] = parsedValue.data;
        next() 
    }
}
