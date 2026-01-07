//const API_URL = 'http://localhost:8000/v1'; //nthis should be used when we run the app locally without docker
//the above line becomes 'const API_URL = 'v1';' when we dockerize the app, because , the container will detect the right address by itself(relative path) (Hostname and port using service discovery)
const API_URL = 'v1';
async function httpGetPlanets() {
  // TODO: Once API is ready. // the following code is added because our API is now ready
  try {
    const response = await fetch(`${API_URL}/planets`);
    // Load planets and return as JSON.
    return await response.json();
  } catch (error) {
    console.error('Error fetching planets:', error);
  }
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  try {
    const response = await fetch(`${API_URL}/launches`);
    // Load launches, sort by flight number, and return as JSON.
    const fetchedLaunches = await response.json();
    return fetchedLaunches.sort((a, b) => {
      return a.flightNumber - b.flightNumber;
    });
  } catch (error) {
    console.error('Error fetching launches:', error);
  }
}

async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  // Submit given launch data to launch system.
  try {
    const response = await fetch(`${API_URL}/launches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(launch),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to submit launch',
    };
  }
  // Return the response as JSON.
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.
  try {
    const response = await fetch(`${API_URL}/launches/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return {
      sucess: false,
      message: 'Failed to abort the launch',
    };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
