// This file sets up the express app and serves the static files for the front end section of the site

// Import necessary packages
const path = require('path')
const dotenv = require('dotenv')
const cors = require('cors');
const express = require('express')

// Import app after that has been setup in setupApp.js
const app = require('./setupApp')

// Setup App
const port = process.env.PORT
const buildPath = path.join(__dirname, 'build')
app.use(express.static(buildPath))
app.use(cors())
dotenv.config()

// gets the static files from the build folder
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})

// Showing that the server is online and running and listening for changes
app.listen(port, () => {
  console.log(`Server is online on port: ${port}`)
})