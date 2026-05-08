const express = require('express')

const app = express();
const healthRoutes = require('./routes/health.routes')
const authRoutes = require('./routes/auth.routes')

// Middlewares
app.use(express.json())

//Routes
app.use('/',healthRoutes)
app.use('/',authRoutes)

module.exports = app;