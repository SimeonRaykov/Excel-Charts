const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/STP-Predictions', (req, res) => {
    let sql = 'INSERT IGNORE INTO prediction (client_id, date, amount, type, created_date) VALUES ?';
    let query = db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
    });
    // console.log(query.sql);  
    console.log('STP Predictions inserted');
    return res.send("STP Predictions added");
});

module.exports = router;