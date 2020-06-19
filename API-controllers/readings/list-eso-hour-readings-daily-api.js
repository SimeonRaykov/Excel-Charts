const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/eso-hour-readings/daily/:id/:date', (req, res) => {
    let sql = `SELECT hour_readings_eso.id,
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
    type,
    created_date,
    clients.ident_code
    FROM hour_readings_eso
    INNER JOIN clients ON clients.id = hour_readings_eso.client_id
    WHERE hour_readings_eso.date = '${req.params.date}'
    AND hour_readings_eso.id = '${req.params.id}'`;
    
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/eso-graph-predictions/daily/:id/:date', (req, res) => {
    let sql = `SELECT hour_prediction_eso.id,
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
    created_date,
    clients.ident_code
    FROM hour_prediction_eso
    INNER JOIN clients ON clients.id = hour_prediction_eso.client_id
    WHERE hour_prediction_eso.date = '${req.params.date}'
    AND hour_prediction_eso.id = '${req.params.id}'`;
    console.log(sql);
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;