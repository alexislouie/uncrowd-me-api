const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const busy_hours = require('busy-hours');

const router = express.Router();
const jsonParser = bodyParser.json();

const PLACES_API_KEY = process.env.PLACES_API_KEY;
const jwtAuth = passport.authenticate('jwt', { session: false });

const cors = require('cors');
const CLIENT_ORIGIN = require('../config');
const corsOptions = {
    origin: CLIENT_ORIGIN
}

router.options('*', cors());
router.get('/:placeId', cors(corsOptions), jsonParser, (req, res) => {
    const { placeId } = req.params;
    busy_hours(placeId, PLACES_API_KEY)
        .then(res => {
            console.log('res: ', res);
            if (res.status === 'ok' || res.status === 'error') {
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