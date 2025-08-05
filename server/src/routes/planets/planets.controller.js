const { getAllPlanets } = require('../../models/planets.model'); // require() runs  the file that is required in node.js; same behavior as import

function httpGetAllPlanets(req, res) {
  return res.status(200).json(getAllPlanets()); //the "return" here is quite important as it means stop executing the controller once the response is set and helps us to avoid unnecessary bugs
}

module.exports = {
  httpGetAllPlanets,
};
