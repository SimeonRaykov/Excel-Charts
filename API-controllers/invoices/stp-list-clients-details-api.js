const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/getClientDetails/:id', (req, res) => {
    let client_id = req.params.id;
    let sql = `SELECT clients.id, clients.client_name, invoicing.operator AS operator, invoicing.time_zone, invoicing.id AS reading_id, period_from, period_to, value_bgn, type
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE client_id = '${client_id}';`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});

module.exports = router;