const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/exchange-prices/daily/:id/:date', (req, res) => {
    let sql = `SELECT exchange_prices.id,
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
    hour_twentythree
    FROM exchange_prices
    WHERE exchange_prices.date = '${req.params.date}'
    AND exchange_prices.id = '${req.params.id}'`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;