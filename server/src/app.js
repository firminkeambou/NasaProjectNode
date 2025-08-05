// this file contains every configuration related to the middleware
const path = require('path');
const express = require('express');
const cors = require('cors')
const morgan = require('morgan'); // this is a middleware to log the requests, but it is not used in this project
const planetsRouter = require('./routes/planets/planets.router')
const launchesRouter = require('./routes/launches/launches.router')
const app = express();
//console.log(cors)
//let's place the call to the cors middleware right here at the top because it gets applied to all origin, 
//app.use(cors());  // ====this way of calling the API by default without parameters  allows calls from any origins
// this is the middleware to allow cross-origin requests, so that the client can call the API
app.use(cors({
    origin:'http://localhost:3000'  // this is very specific and the way a middleware should be used
})); 

// adding morgan middleware to log the requests
 app.use(morgan("combined")) //
 
app.use(express.json()) // middleware to parse any incoming request into json format
app.use(express.static(path.join(__dirname, '..', 'public'))) // this is the middleware to serve static files (react client files), like the index.html file 
// As the http://localhost:8000/index.html doesnt load by default, the below code will solve the issue; 

app.use('/planets', planetsRouter)  // mounting the planetsRouter at the /planets path
app.use('/launches',launchesRouter) // mounting the launchesRouter at the /launches path
/* *
the below code is a catch-all route that will match any request that doesn't match the above routes, and not very useful when testing the API
app.get('/{*splat}', (req,res) => { // this is a catch-all route that will match any request that doesn't match the above routes
  // this is a catch-all route that will match any request that doesn't match the above routes
    res.sendFile(path.join(__dirname,'..','public','index.html'))
}) 
    */
module.exports = app;