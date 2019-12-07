const express = require('express');
const bodyParser = require('body-parser');
const PLACES_API_KEY = process.env.PLACES_API_KEY;
const googleMapsClient = require('@google/maps').createClient({
    Promise: Promise,
    key: PLACES_API_KEY
});
const cors = require('cors');
const CLIENT_ORIGIN = require('../config');
const corsOptions = {
    origin: CLIENT_ORIGIN
}

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/', cors(corsOptions), jsonParser, (req, res) => {
    const { query, location } = req.query;
    const radius = parseInt(req.query.radius);

    googleMapsClient.geocode({
        address: location
    })
        .asPromise()
        .then(res => { return res.json.results })
        .then(results => {
            const latlng = results[0].geometry.location;
            const coordinatesAsArray = Object.values(latlng);
            return coordinatesAsArray;
        })
        .then(coordinatesAsArray => {
            googleMapsClient.places({
                query: query,
                location: coordinatesAsArray,
                radius: radius
            })
                .asPromise()
                .then(res => {
                    console.log('res received');
                    if (res.status === 200) {
                        return res;
                    } 
                    else {
                        throw Error(`Request rejected with status ${res.status}`);
                    }
                })
                .catch(console.error)
                .then(data => {
                    const resultsObj = {
                        places: data.json.results,
                        userCoordinates: coordinatesAsArray
                    }
                    res.status(200).json(resultsObj);
                })
        })
})


module.exports = router;