const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const busy_hours = require('busy-hours');

const router = express.Router();
const jsonParser = bodyParser.json();

const PLACES_API_KEY = process.env.PLACES_API_KEY;
const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/:placeId', jsonParser, (req, res) => {
    const { placeId } = req.params;
    // console.log(placeId);
    busy_hours(placeId, PLACES_API_KEY)
        .then(data => {
            console.log('data: ', data);
        })
})


module.exports = router;