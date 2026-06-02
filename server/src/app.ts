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
import { globalLimiter } from './middlewares/rateLimit.middleware';
import requestIdMiddleware from './middlewares/requestId.middleware';

const app = express();
app.use(requestIdMiddleware);

app.use(globalLimiter);

app.use(helmet());

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}));

app.use(compression());

app.use(express.json());
app.use(cookieParser());
app.use(logger); // Must stay above routes, Morgan attaches listeners to the response lifecycle. The actual reason is that middleware executes in registration order, so putting it before routes guarantees every request passes through it.

app.use('/', healthRoutes);
app.use('/', authRoutes);
app.use('/', transactionRoutes);
app.use('/',analyticsRoutes);


app.use(errorMiddleware);

export default app;