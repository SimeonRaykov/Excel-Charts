const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/STP-Predictions', (req, res) => {
    console.log(1)
    let sql = `INSERT INTO prediction (client_id, date, amount, type, created_date) VALUES ?
    ON DUPLICATE KEY UPDATE
    client_id=VALUES(client_id),
    amount=VALUES(amount),
       date=VALUES(date)`;
    console.log(2)
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
    });
    console.log('Данните за СТП Графици са качени в базата');
    return res.send("Данните за СТП Графици са качени в базата");
});

module.exports = router;