"use strict";
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const userRouter = require('./routes/users');
const busyHoursRouter = require('./routes/busyHours');
const placesRouter = require('./routes/places');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const {PORT, CLIENT_ORIGIN, DATABASE_URL} = require('./config');

const app = express();

if (require.main === module) {
  app.use(morgan('common'));
}

app.options('*', cors())
app.use(cors());
// app.use(
//   cors({
//       origin: CLIENT_ORIGIN
//   })
// );

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.static("public"));

app.use('/users', userRouter);
app.use('/busyHours', busyHoursRouter);
app.use('/findPlaces', placesRouter);
app.use('/auth', authRouter)

app.patch('/test', require('body-parser').json(), (req, res) => {
  console.log(req);
  res.json(req.body)
})

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };