// This file sets up the express app and serves the static files for the front end section of the site
/* 
The code in this file was taken from the below article
https://dev.to/pixelrena/deploying-your-reactjs-expressjs-server-to-rendercom-4jbo
*/
// Import necessary packages
const path = require('path')
const dotenv = require('dotenv')
const cors = require('cors');
const express = require('express')

dotenv.config()
// Import app after that has been setup in setupApp.js
const app = require('./setupApp')

// Setup App
const port = process.env.PORT
const buildPath = path.join(__dirname, 'build')

app.use(express.static(buildPath))

app.use(cors({
  origin: 'https://film-friends.onrender.com/',
}));

// gets the static files from the build folder
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})

// Showing that the server is online and running and listening for changes
const server = app.listen(port, () => {
  console.log(`Server is online on port: ${port}`)
})

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000