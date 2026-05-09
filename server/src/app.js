const express = require('express')

const app = express();
const healthRoutes = require('./routes/health.routes')
const authRoutes = require('./routes/auth.routes')
const transactionRoutes = require('./routes/transaction.routes')

// Middlewares
app.use(express.json())

//Routes
app.use('/',healthRoutes)
app.use('/',authRoutes)
app.use('/',transactionRoutes)

module.exports = app;