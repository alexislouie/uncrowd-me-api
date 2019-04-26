const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const User = require('../models');

const router = express.Router();
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    const filter = {};
    const queryableFields = ['userName']
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filter[field] = req.query[field];
        }
    });
    User
        .find(filter)
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

router.get('/:id', jwtAuth, (req, res) => {
    User
        .findById(req.params.id)
        .populate('userProgramsVirtual')
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.post('/register', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['firstName', 'lastName', 'userName', 'password'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    const trimmedFields = ['userName', 'password'];
    const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
    if (notTrimmedFields) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: notTrimmedFields
        })
    }

    const fieldSizes = {
        userName: {
            min: 3,
            max: 20
        },
        password: {
            min: 8,
            max: 72
        }
    };
    const tooSmallField = Object.keys(fieldSizes).find(
        field =>
            'min' in fieldSizes[field] && req.body[field].trim().length < fieldSizes[field].min
    );
    const tooLargeField = Object.keys(fieldSizes).find(
        field =>
            'max' in fieldSizes[field] && req.body[field].trim().length > fieldSizes[field].max
    );
    if (tooSmallField || tooLargeField) {
        res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${fieldSizes[tooSmallField]
                    .min} characters long`
                : `Must be at most ${fieldSizes[tooLargeField]
                    .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let { userName, password, firstName = '', lastName = '' } = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User
        .find({ userName: userName })
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User
                .create({
                    firstName,
                    lastName,
                    userName,
                    password: hash
                });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: 'Internal Server Error' });
        });
});

router.patch('/:id', jwtAuth, jsonParser, (req, res) => {
    if (!(req.body.op === 'add') && !(req.body.op === 'remove')) {
        return res.status(400).json({
            code: 400,
            message: 'Invalid Operation'
        });
    }

    if (req.body.path === 'savedPrograms') {
        if (req.body.op === 'add') {
            return User
                .findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { savedPrograms: req.body.value } },
                    { new: true }
                )
                .then(user => {
                    //console.log(user);
                    res.status(201).json(user.serialize())});
        }

        if (req.body.op === 'remove') {
            User
                .findById(req.params.id)
                .then(user => {
                    const index = user.savedPrograms.indexOf(req.body.value);
                    user.savedPrograms.splice(index, 1);
                    user.save();

                    return user;
                })
                .then(user => res.status(201).json(user.serialize()));
        }
    } 
    else {
        return res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
        });
    }
})



module.exports = router;