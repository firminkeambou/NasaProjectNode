const launches = new Map();

/*const launch ={
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030').toISOString(),
    target: 'Kepler-442 b',
    customers: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
}


launches.set(launch.flightNumber, launch);
*/

const getAllLaunches = () =>  Array.from(launches.values()) // returns an array of all launches in the format needed by our controller

function addNewLaunch(launch) {
    // Check if the launch has all required properties
    const latestFlightNumber = (launches.size === 0) ? 199 : Math.max(...launches.keys());
    const CurrentFlightNumber = latestFlightNumber + 1;
    launches.set(
        CurrentFlightNumber,
        Object.assign(launch, {
            upcoming: true,
            success: true,
            customers: ['NASA', 'Zero To MAstery'],
            flightNumber: CurrentFlightNumber
        })
    );
}

function existsLaunchWithId(launchId) {
    return launches.has(launchId);
}
// we  write the function this way so that we can keep the aborted launch in the database for historical purposes, but we could also delete it if we wanted to
function abortLaunchById(launchId) {
  const aborted = launches.get(parseFloat(launchId));
   // launches.delete(launchId); if we didn't want to keep the aborted launch in the database, we could delete it, but we want to keep it for historical purposes

    // If it exists, we set the upcoming property to false and return true
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById
};