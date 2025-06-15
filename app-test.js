require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./app'); // path to your app.js

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Planet API', () => {
  it('should return 404 for unknown planet id', async () => {
    const res = await request(app)
      .post('/planet')
      .send({ id: 99 });

    expect(res.statusCode).toBe(404);
    expect(res.text).toMatch(/Ooops/);
  });
});
