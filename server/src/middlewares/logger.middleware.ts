// middlewares/logger.middleware.ts

import { Request } from 'express';
import morgan from 'morgan';

morgan.token('request-id',(req:Request)=>req.requestId)

const logger = morgan(
'[:request-id] :method :url :status :response-time ms'
);

export default logger;