const express = require('express')

const app = express();
const healthRoutes = require('./routes/health.routes')

// Middlewares
app.use(express.json())

//Routes
app.use('/',healthRoutes)

module.exports = app;