const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');
const apiV1Router = require('express').Router(); // creating a new router for version 1 of the API

apiV1Router.use('/planets', planetsRouter); // mounting the planetsRouter at the /planets path
apiV1Router.use('/launches', launchesRouter); // mounting the launchesRouter at the /launches path

module.exports = apiV1Router; // exporting the router so it can be used in the app.js file
// This way, we can version our API and add new versions in the future without breaking the
