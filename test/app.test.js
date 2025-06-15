const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

require('dotenv').config();

chai.use(chaiHttp);
const expect = chai.expect;

let mongoServer;

before(async () => {
  console.log('Mongoose models before:', Object.keys(mongoose.models)); // Debug
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();

  await mongoose.connect(uri);

  console.log('Mongoose models after:', Object.keys(mongoose.models)); // Debug
  const planetModel = mongoose.model('planets');

  await planetModel.create({
    name: 'Earth',
    id: 3,
    description: 'Third planet from the Sun',
    image: 'earth.jpg',
    velocity: '29.78 km/s',
    distance: '149.6 million km'
  });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('🌍 Planet API', () => {
  it('should confirm the app is live', async () => {
    const res = await chai.request(app).get('/live');
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('live');
  });

  it('should confirm the app is ready', async () => {
    const res = await chai.request(app).get('/ready');
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('ready');
  });

  it('should return 404 for unknown planet ID', async () => {
    const res = await chai.request(app)
      .post('/planet')
      .send({ id: 99 });

    expect(res).to.have.status(404);
    expect(res.text).to.include('Ooops');
  });

  it('should return planet data for valid ID', async () => {
    const res = await chai.request(app)
      .post('/planet')
      .send({ id: 3 });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('name').equal('Earth');
    expect(res.body).to.have.property('id').equal(3);
  });
});