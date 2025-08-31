const {
  getAllLaunches,
  //addNewLaunch,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model'); // launches is a Map object, so we can use it like a dictionary and "Array.from" to convert it to an array
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  //console.log(req.query);
  const { limit, skip } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches); //Array.from(launches.values()) the "return" here is quite important as it means stop executing the controller once the response is set and helps us to avoid unnecessary bugs
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  // Check if the launch has all required properties
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    //if each property is missing, evaluate the truthiness of the properties, AS Soon AS ONE OF THEM IS FALSY, the condition will be true
    // if one of them is falsy, the condition will be true

    return res
      .status(400)
      .json({ error: 'Missing required launch properties' });
  }
  // Check if the launch date is a valid date
  if (isNaN(Date.parse(launch.launchDate))) {
    // Date.parse() returns NaN if the date is invalid, so we check if it is NaN
    return res.status(400).json({ error: 'Invalid launch date' });
  }
  //launch.launchDate = new Date(launch.launchDate); //this line is no longer needed as the front end populates this// convert the date to a Date object
  //addNewLaunch(launch);
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch); // 201 means created, and we return the launch object that was just created
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id); // req.params.id here is a flight number
  // console.log(launchId)
  // Check if  launch  doesn't exist
  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) {
    // if the launch doesn't exist, we return a 404 error
    return res.status(404).json({
      success: false,
      error: 'Launch not found',
    });
  }

  // check if launch does exist
  const aborted = await abortLaunchById(launchId); // we call the function to abort the launch, which will return the aborted launch object
  //console.log('le freeboyyyyyyyyyyyy', aborted);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }

  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
