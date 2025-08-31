const axios = require('axios');
//const launches = new Map();
const launches = require('./launches.schema.mongo');
const planets = require('./planets.schema.mongo'); // we want to use this for kind of referential integrity
const DEFAULT_FLIGHT_NUMBER = 100;
/*const launch = {
  flightNumber: 102, // === flight_number in SPACEX API
  mission: 'Kepler Exploration X', // === name in SPACEX API
  rocket: 'Explorer IS1', // === rocket.name in SPACEX API
  launchDate: new Date('December 27, 2030').toISOString(), // === date_local in SPACEX API
  target: 'Kepler-442 b', // not applicable
  customers: ['NASA', 'ZTM'], // === payload.customers for each payload in SPACEX API
  upcoming: true, // === upcoming in SPACEX API
  success: true, // === success in SPACEX API
};*/

//launches.set(launch.flightNumber, launch);  // this was when we used Map data Structure

//const getAllLaunches = () => Array.from(launches.values()); // returns an array of all launches in the format needed by our controller, using a map data structure stored locally

const getAllLaunches = async (skip, limit) =>
  await launches
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 }) // 1 for ascending order, -1 for descending order
    .skip(skip)
    .limit(limit); //getting all the objects as the filter is empty
//Load launches data

const populateLaunches = async () => {
  const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
  console.log('Downloading launch data ...');
  //the options for the query comes from the documentation of SpaceX API
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }
  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    //flatMap means to map each element to a new array and then flatten the result into a single array
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });
    const launch = {
      flightNumber: Number(launchDoc['flight_number']),
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    saveLaunch(launch);
  }
};

const loadLaunchesData = async () => {
  // the below code assumes that, if the specific lauch is found, it means we have already downloaded the launches in mongo DB
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  if (firstLaunch) {
    console.log('Launch data already loaded');
    return;
  } else {
    await populateLaunches();
  }
};

//save launches in the MongoDB
const saveLaunch = async (launch) => {
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
  //the below line is trying to test this idea of foreign key, looking if the planet exists in another collection
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

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

// helper function that check if a launch has already been downloaded from the API
async function findLaunch(filter) {
  return await launches.findOne(filter); // filter is an object
}

// function Checking flight number existence with MongoDB
async function existsLaunchWithId(launchId) {
  // launches.findOne here can be replace with findLaunch
  return await launches.findOne({
    flightNumber: launchId,
  }); // instead of launches.findById , because findById refers to what is stored inside the MongoDB
}

// dealing with flight number , like primary key in mongoDB

async function getLatestFlightNumber() {
  const latestLaunch = await launches
    .findOne({}) //will return the first elt in the list
    .sort('-flightNumber'); // "-" descending sort in mongoDB
  //console.log('latestLaunch', latestLaunch);
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
  loadLaunchesData,
  getAllLaunches,
  //addNewLaunch,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
