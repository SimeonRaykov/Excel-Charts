const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/STP-Predictions', (req, res) => {
    let sql = 'INSERT IGNORE INTO prediction (client_id, date, amount, type, created_date) VALUES ?';
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
    }); 
    console.log('Данните за СТП Графици са качени в базата');
    return res.send("Данните за СТП Графици са качени в базата");
});

module.exports = router;