const mongoose = require('mongoose');
// schema, an object which is like creating a table in SQL, it defines the structure of the data, but hardCoded
// model, an object which is like an instance of a class in OOP, it is used to create
const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
    unique: true,
    default: 100, // default value for the first launch
    min: 100, // minimum value for the flight number
    max: 999, // maximum value for the flight number
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  /*
   right approcach but to avoid complexity during querying time, we will not use it, instead we will duplicate that field here
  target: {
    type: mongoose.Schema.Types.ObjectId, // like a foreign key in SQL, it is a reference to another collection
    ref: 'Planet', // reference to the Planet model
    required: true,
  },*/
  target: {
    type: String, // we will use the name of the planet instead of the ObjectId
    required: true,
  },
  customers: {
    type: [String], // array of strings, like a list of customers
    //required: true, we comment out this section because we want to allow launches without planets at this time
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true, // default value for the success field
  },
});
//this name "Launch" should always be singular, and mongo will automatically create a collection with the plural version of the name "launches"
// the first argument is the name of the model, the second argument is the schema
module.exports = mongoose.model('Launch', launchesSchema); // creating and exporting the model so it can be used in other files
