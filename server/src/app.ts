import express from 'express';

import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import analyticsRoutes from './routes/analytics.routes';

import errorMiddleware from './middlewares/error.middleware';
import logger from './middlewares/logger.middleware';
const app = express();

app.use(helmet());

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}));

app.use(compression());

app.use(express.json());
app.use(cookieParser());
app.use(logger); // Must stay above routes, else route would send response and control would never reach morgan/logger


app.use('/', healthRoutes);
app.use('/', authRoutes);
app.use('/', transactionRoutes);
app.use('/',analyticsRoutes);


app.use(errorMiddleware);

export default app;