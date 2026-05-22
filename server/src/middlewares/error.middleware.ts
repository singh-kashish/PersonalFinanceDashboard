import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

const errorMiddleware = (err:unknown, _req:Request, res:Response, _next:NextFunction):void => {
    console.error(err);
    let statusCode = 500;
    let message = "Internal Server Error"
    if(err instanceof AppError){
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorMiddleware;