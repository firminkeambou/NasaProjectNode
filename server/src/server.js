const http = require('http');
const mongoose = require('mongoose');
//in App, we configured everything related to express
const app = require('./app');
// exporting the model which is asynchrone , so we can await it before starting listening requests from the server
const { loadPlanetsData } = require('./models/planets.model');
const PORT = process.env.PORT || 8000;

const MONGO_URL =
  'mongodb+srv://admindbuser:admin123@nasaprojectcluster.hpvj4l0.mongodb.net/nasa?retryWrites=true&w=majority&appName=NasaProjectCluster'; // "nasa" here is the name of the database, and it is not a good practice to hardcode it like this, but for the sake of simplicity, we will do it here, if it doesn't exist, it will be created automatically by MongoDB

const server = http.createServer(app); // without "app", the server won't be able to do anything

mongoose.connection.once('open', () => {
  // mongoose.connection ==event emitter get called only once when the connection is established
  console.log('Connected to MongoDB successfully!');
});
//places for event listeners don't matter once we require mongoose, at the top
mongoose.connection.on('error', (err) => {
  // this is to catch any error that might happen during the connection
  console.error('Error connecting to MongoDB:', err);
});

// the way this function ("startServer()") is written down her is quite a common pattern when we need
// to load data  or do some kind of tasks before starting listening from the server
async function startServer() {
  await mongoose.connect(MONGO_URL, {
    //useNewUrlParser: true,true, as from node version 4.4 is no longer needed
    //useFindAndModify: false, // this is to avoid deprecation warnings== outdated way of updating mongo data
    // useCreateIndex: true,
    //useUnifiedTopology: true, as from node version 4.4 is no longer needed
  }); // connecting to the database, and it is an asynchronous operation, so we need to await it

  await loadPlanetsData(); //calling of an asynchronous function , especially a promise in this case
  server.listen(PORT, () => {
    console.log(` Listening on port ${PORT} ...`);
  });
}
startServer(); // running the server now is very normal  because we are sure
// that data at this very moment have been already fetch from the back end and available to use in the front-end
