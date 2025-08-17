// prerequisites  === install  npm install csv-parse
// make sure to always import built-in modules before resorting to third parties modules
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

//
const planets = require('./planets.schema.mongo'); // importing the model created from  planets schema
// a readable Stream is a kind of eventEmitter
//parse function returns an event emitter, but parse only deal with  stream of data
// const variable  means we can't reassign the variable, but we can update the content hold by the variable especialy if it's an array
//const habitablePlanets = [];  === all data structure without mongoDB

function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

function loadPlanetsData() {
  // fs.createReadStream returns raw buffer of bytes,and most importantly, binary data, that then needs to be parsed so users can exploit it

  //  we inserted this section of the code in a function because this part of code runs asynchronously  we should  make sure tht we got the data back before handing over to the front-end
  // because the below code is asynchronous, it will returns a promise ; fs.createReadStream retur a promise
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    ) // return a readable stream
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          //read a file and insert in a database
          //TODO: Replace below create with insert + update === upsert
          // storing data in MongoDB
          savePlanet(data);
          // we are using the model to create a new document in the database
          /*
          await planets.create({
            keplerName: data['kepler_name'], // we are using the name of the planet as it is in the CSV file
          });*/
          // storing data in MongoDB

          //habitablePlanets.push(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err); // message send back if the promise is failed
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        //console.log('Done')
        resolve(); // resolving the promise, but we didn't return anything because
      });
  });
}
// returns all the planets
getAllPlanets = async () => {
  return await planets.find({}, { _id: 0, __v: 0 }); // excluding "_id", "__v"
  //return await planets.find({}, { _id: 0, __v: 0 }); // find all planets because of "{}" object which is a filter, here we have empty filter, but exclude the _id (_id:0) and __v (__v:0) fields from the result ()
  //return habitablePlanets; /before using mongoDB/ returns an array of all planets in the format needed by our controller
};
// when exporting, you can decide which key to set for the object being exporting
// a bit of a concepttual program when we need to export something that relies on an asynchronous code
//loadPlanetsData

savePlanet = async (planet) => {
  // updateOne(param1,param2,param3) // param1=filter what to find, param2 = update to be done; param3 = upsert means create if the data don't exist or update if the data do exist
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`could not save planet  ${err}`);
  }
};

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
