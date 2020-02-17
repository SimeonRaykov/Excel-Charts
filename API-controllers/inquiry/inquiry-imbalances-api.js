const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/data-listings/imbalances', (req, res) => {
    let sql = `(SELECT DISTINCT clients.ident_code, clients.client_name
        FROM clients
        WHERE metering_type = 2
        AND profile_id != 0)
        UNION
        (SELECT clients.ident_code, clients.client_name FROM clients 
         WHERE metering_type = 1)`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;