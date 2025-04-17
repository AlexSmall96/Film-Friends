// This file sets up the express app for use by server.js and and router tests

// Import express and bodyParser
const express = require('express')
const bodyParser = require('body-parser'); 

// Import files
require('./db/mongoose')
const userRouter = require('./routers/user')
const filmRouter = require('./routers/film')
const requestRouter = require('./routers/request')
const recRouter = require('./routers/reccomendation')

// Setup express app
const app = express()
app.use(bodyParser.json({ limit: '100mb' })); 
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json({limit: '100mb'}));
app.use(userRouter)
app.use(filmRouter)
app.use(requestRouter)
app.use(recRouter)

module.exports = app