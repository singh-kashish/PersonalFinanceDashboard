import express from 'express';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
// import transactionRoutes from './routes/transaction.routes';

import errorMiddleware from './middlewares/error.middleware';

const app = express();

app.use(express.json());

app.use('/', healthRoutes);
app.use('/', authRoutes);
// app.use('/', transactionRoutes);

app.use(errorMiddleware);

export default app;