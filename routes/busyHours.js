const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const busy_hours = require('busy-hours');
const cors = require('cors');

const router = express.Router();
const jsonParser = bodyParser.json();

const PLACES_API_KEY = process.env.PLACES_API_KEY;
const jwtAuth = passport.authenticate('jwt', { session: false });

// const gmaps = require('@google/maps').createClient({
//     key: PLACES_API_KEY,
//     Promise: Promise
// });

router.get('/:placeId', cors(), jsonParser, (req, res) => {
    const { placeId } = req.params;

    
    // gmaps.place(({ placeid: placeId })).asPromise()
    //     .then(res => {
    //         console.log('res from gmaps.place: ', res)
    //         // if (res) {
    //         //     console.log('res.status: ', res.status)
    //         //     const result = res.json.result;
    //         //     console.log('result....: ', result)
    //         // }
    //         // return result
    //     })
    //     // .then(result => {
    //     //     const html = fetch_html(result.url);
    //     //     return {result, html}
    //     // })
    //     // .then((result, html) => {
    //     //     const { name, formatted_address, geometry: { location } } = result;
    //     //     return Object.assign({ name, formatted_address, location }, process_html(html));
    //     // })
    //     .catch(err => { return { status: 'error', message: 'Error: ' + err } })

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