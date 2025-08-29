const request = require('supertest');
// for request to work, we wiil have to import the app from the app.js file, instance of express
const app = require('../../app'); // Adjust the path as necessary
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
// before Mongoose, we had each test configured infividually
// now, with mongoose, we need to add another describe that will wrap all individual test using a call ball,
//tis way , we are sure the connection is made before any test and
//every test would be able to connect to mongoDB
//let's wrap it right now
describe('TEst Lanches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe('Test Get /launches', () => {
    test('it should response with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/) // Check if the response is in JSON format  (/json/ here is a regular expression that matches any string that contains "json")
        .expect(200);
    });
  });

  describe('Test Post /launches', () => {
    const completeLaunchData = {
      mission: 'Test Mission',
      rocket: 'Test Rocket',
      launchDate: 'January 1, 2026',
      target: 'Kepler-442 b',
    };
    const completeLaunchDataWithoutDate = {
      mission: 'Test Mission',
      rocket: 'Test Rocket',
      target: 'Kepler-442 b',
    };
    const completeLaunchDataWithInvalidDate = {
      mission: 'Test Mission',
      rocket: 'Test Rocket',
      launchDate: 'Invalid Date',
      target: 'Kepler-442 b',
    };

    test('it should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/) // Check if the response is in JSON format which is part of the header
        .expect(201); // Check if the response status is 201 which is part of the header

      //this checks a specific part of the response body, in this case the launchDate property because it failed from the first test
      const requestDate = new Date(completeLaunchData.launchDate).valueOf(); // Get the launchDate from the request data converted to a timestamp
      const responseDate = new Date(response.body.launchDate).valueOf(); // Get the launchDate from the response data converted to a timestamp  (looking for the same unit)

      expect(responseDate).toBe(requestDate); // Check if the launchDate in the response is the same as the one in the request
      //below we check if the response body contains the same data we sent using jest
      expect(response.body).toMatchObject(completeLaunchDataWithoutDate); // Check if the response body contains the same data we sent, but without the launchDate property
      //expect(new Date(response.body.launchDate).toString()).toBe(new Date(completeLaunchData.launchDate).toString()); // Check if the launchDate is the same as the one we sent, but converted to a Date object
    });

    test('it should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchDataWithInvalidDate) // Send the data with an invalid launchDate
        .expect('Content-Type', /json/) // Check if the response is in JSON format which is part of the header
        .expect(400); // Check if the response status is 400 which is part of the header
      // toStrictEqual is a jest matcher that checks if the response body is equal to the object we pass as an argument
      expect(response.body).toStrictEqual({ error: 'Invalid launch date' });
    });

    test('it should catch invalid dates ', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchDataWithoutDate) // Send the data without the launchDate property
        .expect('Content-Type', /json/) // Check if the response is in JSON format which is part of the header
        .expect(400); // Check if the response status is 400 which is part of the header
      // toStrictEqual is a jest matcher that checks if the response body is equal to the object we pass as an argument
      expect(response.body).toStrictEqual({
        error: 'Missing required launch properties',
      });
    });
  });
});
