// This file sets up the express app for use by server.js and and router tests

// Import express
const express = require('express')

// Import files
require('./db/mongoose')
const userRouter = require('./routers/user')

// Setup express app
const app = express()
app.use(express.json())
app.use(userRouter)

module.exports = app