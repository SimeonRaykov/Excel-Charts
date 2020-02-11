const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/hour-readings/daily/:id/:date', (req, res) => {
    let sql = `SELECT *,hour_readings.id AS hrID FROM hour_readings
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