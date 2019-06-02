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

    busy_hours(placeId, PLACES_API_KEY)
        .then(res => {
            if (res.status === 'ok' || res.status === 'error') {
                console.log('res: ', res);
                return res;
            } 
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(data => res.status(200).json(data))
        .catch(console.error)
})


module.exports = router;