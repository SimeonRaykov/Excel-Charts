const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/graphs/hour-prediction/daily/:id/:date', (req, res) => {
    let sql = `SELECT *,hour_prediction.id AS hrID FROM hour_prediction
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

router.get('/api/graphs/stp-hour-prediction/daily/:id/:date', (req, res) => {
    let sql = `SELECT *,hour_prediction.id AS hrID FROM hour_prediction
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

module.exports = router;