//const launches = new Map();
const launches = require('./launches.schema.mongo');
const planets = require('./planets.schema.mongo'); // we want to use this for kind of referential integrity
const DEFAULT_FLIGHT_NUMBER = 100;
/*const launch = {
  flightNumber: 102,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030').toISOString(),
  target: 'Kepler-442 b',
  customers: ['NASA', 'ZTM'],
  upcoming: true,
  success: true,
};*/

//launches.set(launch.flightNumber, launch);  // this was when we used Map data Structure

//const getAllLaunches = () => Array.from(launches.values()); // returns an array of all launches in the format needed by our controller, using a map data structure stored locally

const getAllLaunches = async () => await launches.find({}, { _id: 0, __v: 0 }); //getting all the objects as the filter is empty
//save launches in the MongoDB
const saveLaunch = async (launch) => {
  //the below line is trying to test this idea of foreign key, looking if the planet exists in another collection
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }
  //await launches.updateOne( is less safer than findOneAndUpdate as it doesn't exposes  "$setOnInsert "
  await launches.findOneAndUpdate(
    //filter
    {
      flightNumber: launch.flightNumber,
    },
    launch, //object to add
    {
      upsert: true, // insert if  or update
    }
  );
};
//saveLaunch(launch); this was just for a test purpose
//end saving launches

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['NASA', 'Zero To MAstery'],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}
/*
function addNewLaunch(launch) {
  // Check if the launch has all required properties
  const latestFlightNumber =
    launches.size === 0 ? 199 : Math.max(...launches.keys());
  const CurrentFlightNumber = latestFlightNumber + 1;
  launches.set(
    CurrentFlightNumber,
    Object.assign(launch, {
      upcoming: true,
      success: true,
      customers: ['NASA', 'Zero To MAstery'],
      flightNumber: CurrentFlightNumber,
    })
  );
}
*/
// version with hash Table
/*function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}*/

// version with MongoDB
async function existsLaunchWithId(launchId) {
  return await launches.findOne({
    flightNumber: launchId,
  }); // instead of launches.findById , because findById refers to what is stored inside the MongoDB
}

// dealing with flight number , like primary key in mongoDB

async function getLatestFlightNumber() {
  const latestLaunch = await launches
    .findOne({}) //will return the first elt in the list
    .sort('-flightNumber'); // "-" descending sort in mongoDB

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}
// we  write the function this way so that we can keep the aborted launch in the database for historical purposes, but we could also delete it if we wanted to
async function abortLaunchById(launchId) {
  //first argument is a filter and second arguments are field to update. updateOne don't use Upsert as we are only really interested in Updating , nothing to do with Insert
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  ); // this return the metadata related to the transaction
  return aborted.modifiedCount === 1 && aborted.matchedCount === 1; // boolean ensuring us that we modified only a single element
  // old implementation with hash table
  /*
  const aborted = launches.get(parseFloat(launchId));
  // launches.delete(launchId); if we didn't want to keep the aborted launch in the database, we could delete it, but we want to keep it for historical purposes

  // If it exists, we set the upcoming property to false and return true
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
  */
}

module.exports = {
  getAllLaunches,
  //addNewLaunch,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
