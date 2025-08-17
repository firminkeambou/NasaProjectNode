const { getAllPlanets } = require('../../models/planets.model'); // require() runs  the file that is required in node.js; same behavior as import

async function httpGetAllPlanets(req, res) {
  const planets = await getAllPlanets();
  return res.status(200).json(planets); //the "return" here is quite important as it means stop executing the controller once the response is set and helps us to avoid unnecessary bugs
}

module.exports = {
  httpGetAllPlanets,
};
