const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js'); 

router.get('/api/graphs/hour-prediction/daily/:id/:date', (req, res) => {
    let sql = `SELECT hour_prediction.id,
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
    type,
    erp,
    created_date,
    client_name,
    client_number,
    ident_code,
    metering_type,
    erp_type,
    profile_id,
    is_manufacturer,
    date_created, hour_prediction.id AS hrID FROM hour_prediction
    INNER JOIN clients on hour_prediction.client_id = clients.id
    WHERE hour_prediction.date = '${req.params.date}' AND hour_prediction.id = '${req.params.id}'
    ORDER BY hour_prediction.id
    LIMIT 1`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/graphs/stp-hour-prediction/monthly/:id/:date', (req, res) => {
    let sql = `SELECT ident_code, profile_coef.date, hour_zero, hour_one, hour_two, 
    hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten,
    hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen,
    hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
    hour_twentytwo, hour_twentythree, amount FROM prediction
    INNER JOIN clients ON prediction.client_id = clients.id
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    WHERE MONTH(profile_coef.date) = MONTH('${req.params.date}')
    AND YEAR(profile_coef.date) = YEAR('${req.params.date}')
    AND prediction.id = '${req.params.id}'`;

   db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;