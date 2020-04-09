const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/hour-readings/daily/:id/:date', (req, res) => {
    let sql = `SELECT hour_readings.id,
    client_id,
    date,
    hour_zero,
    hour_one,
    hour_two,
    hour_three,
    hour_four,
    hour_five,
    hour_six,
    hour_seven,
    hour_eight,
    hour_nine,
    hour_ten,
    hour_eleven,
    hour_twelve,
    hour_thirteen,
    hour_fourteen,
    hour_fifteen,
    hour_sixteen,
    hour_seventeen,
    hour_eighteen,
    hour_nineteen,
    hour_twenty,
    hour_twentyone,
    hour_twentytwo,
    hour_twentythree,
    energy_type,
    created_date,
    diff,
    client_name,
    client_number,
    ident_code,
    metering_type,
    erp_type,
    profile_id,
    is_manufacturer,
    date_created, hour_readings.id AS hrID FROM hour_readings
    INNER JOIN clients on hour_readings.client_id = clients.id
    WHERE hour_readings.date = '${req.params.date}' AND hour_readings.id = '${req.params.id}'`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;