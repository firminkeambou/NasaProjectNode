const http = require('http');
require('dotenv').config(); // this will load the environment variables from the .env file into process.env
//const mongoose = require('mongoose');
//in App, we configured everything related to express
const app = require('./app');
const { mongoConnect } = require('./services/mongo');

// exporting the model which is asynchrone , so we can await it before starting listening requests from the server

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app); // without "app", the server won't be able to do anything

// the way this function ("startServer()") is written down her is quite a common pattern when we need
// to load data  or do some kind of tasks before starting listening from the server
async function startServer() {
  await mongoConnect();
  await loadPlanetsData(); //calling of an asynchronous function , especially a promise in this case
  await loadLaunchesData(); // calling of an asynchronous function , especially a promise in this case
  server.listen(PORT, () => {
    console.log(` Listening on port ${PORT} ...`);
  });
}
startServer(); // running the server now is very normal  because we are sure
// that data at this very moment have been already fetch from the back end and available to use in the front-end
