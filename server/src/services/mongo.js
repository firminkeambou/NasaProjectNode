const mongoose = require('mongoose');
require('dotenv').config(); // load environment variables from .env file
const MONGO_URL = process.env.MONGODB_URI; // we get the connection string from the environment variable

mongoose.connection.once('open', () => {
  // mongoose.connection ==event emitter get called only once when the connection is established
  console.log('Connected to MongoDB successfully!');
});
//places for event listeners don't matter once we require mongoose, at the top
mongoose.connection.on('error', (err) => {
  // this is to catch any error that might happen during the connection
  console.error('Error connecting to MongoDB:', err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL, {
    //useNewUrlParser: true,true, as from node version 4.4 is no longer needed
    //useFindAndModify: false, // this is to avoid deprecation warnings== outdated way of updating mongo data
    // useCreateIndex: true,
    //useUnifiedTopology: true, as from node version 4.4 is no longer needed
  }); // connecting to the database, and it is an asynchronous operation, so we need to await it
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}
module.exports = {
  mongoConnect,
  mongoDisconnect,
};
