const express = require('express');
const { httpGetAllPlanets } = require('./planets.controller');
const planetsRouter = express.Router();

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;

// the final routes will start right frome here with "/", then "v1" from the mount point in the app.js file, then "planets" from the planets.router.js file
// so the final route will be "/v1/planets" and it will be used
