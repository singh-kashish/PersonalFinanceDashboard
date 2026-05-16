const express = require('express');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());

app.use('/', healthRoutes);
app.use('/', authRoutes);
app.use('/', transactionRoutes);

app.use(errorMiddleware);

module.exports = app;