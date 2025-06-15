const express = require('express');
const path = require('path');
const fs = require('fs');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

const Schema = mongoose.Schema;

const dataSchema = new Schema({
  name: String,
  id: Number,
  description: String,
  image: String,
  velocity: String,
  distance: String
});

const planetModel = mongoose.model('planets', dataSchema);

// Connect to MongoDB (called manually in production, controlled by tests)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solar-system', {
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Only connect in non-test environments
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.post('/planet', async function (req, res) {
  try {
    const planetData = await planetModel.findOne({ id: req.body.id });
    if (!planetData) {
      return res.status(404).send("Ooops, we only have 9 planets and a sun. Select a number from 0 - 9");
    }
    res.send(planetData);
  } catch (err) {
    console.error('Error in /planet:', err);
    res.status(500).send("Error in Planet Data");
  }
});

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/api-docs', (req, res) => {
  fs.readFile('oas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading oas.json:', err);
      res.status(500).send('Error reading file');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.get('/os', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({
    "os": OS.hostname(),
    "env": process.env.NODE_ENV
  });
});

app.get('/live', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({ "status": "live" });
});

app.get('/ready', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({ "status": "ready" });
});

// Only start the server when NOT testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log("🚀 Server running on port 3000"));
}

module.exports = app;
module.exports.handler = serverless(app);
module.exports.connectDB = connectDB; // Export for potential manual control