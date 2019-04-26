'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();


const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.userName,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// router.use(bodyParser.json());
// router.post('/login',
//   function (req, res, next) {
//     passport.authenticate('local', function (error, user, info) {
//       console.log('error: ', error);
//       console.log('user: ', user);
//       console.log('info: ', info);

//       if (error) {
//         res.status(401).send(error);
//       } else if (!user) {
//         res.status(401).send(info);
//       } else {
//         next();
//       }

//     })(req, res);
//   }, (req, res) => {
//     // console.log(req.body)
//     const authToken = createAuthToken(req.user.serialize());
//     res.json({authToken});
//     res.status(200).json({authToken});
//   });


const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize());
  const userId = req.user.id;
  res.json({authToken, userId});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = {router};