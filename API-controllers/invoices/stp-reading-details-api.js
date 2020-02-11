const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/getReadingDetails/:id', (req, res) => {
    let reading_id = req.params.id;
    let sql = `SELECT * FROM invoicing WHERE id ='${reading_id}';`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result[0]);
    });
});

module.exports = router;