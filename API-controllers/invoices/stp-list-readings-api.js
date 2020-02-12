const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/getInvoicingClientIDs&Names', (req, res) => {
    let sql = `SELECT DISTINCT clients.id, clients.client_name, ident_code FROM clients
    INNER JOIN invoicing on invoicing.client_id = clients.id;`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});
router.post('/api/filterData', (req, res) => {
    let {
        date_from,
        to_date,
        id,
        name,
        ERP
    } = req.body;
    let sql = `SELECT clients.id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.time_zone, invoicing.id AS invoicing_id,client_number, ident_code, period_from, period_to, value_bgn, type
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE 1=1 `;

    if (date_from != '' && to_date != '') {
        sql += ` AND invoicing.period_from >= '${date_from}' AND invoicing.period_to <= '${to_date}'`
    } else if (date_from != '') {
        sql += ` AND invoicing.period_from >= '${date_from}'`
    } else if (to_date != '') {
        sql += ` AND invoicing.period_to <= '${to_date}'`
    }
    if (name != '') {
        sql += ` AND clients.client_name = '${name}'`;
    }
    if (id != '') {
        sql += ` AND clients.ident_code = '${id}'`;
    }

    if (ERP && ERP.length != 3) {
        if (ERP.length == 1) {
            sql += ` AND invoicing.operator = '${ERP[0]}'`;
        } else if (ERP.length == 2) {
            sql += ` AND ( invoicing.operator = '${ERP[0]}'`;
            sql += ` OR invoicing.operator = '${ERP[1]}' )`;
        } else if (erp.length == 0) {
            return res.send(JSON.stringify([]));
        }
    }

    sql += ' ORDER BY invoicing.id';
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
});
router.get('/api/data-listings/STP-Hour-Readings', (req, res) => {
    let sql = `SELECT DISTINCT clients.ident_code, clients.client_name
     FROM clients
     INNER JOIN stp_hour_readings on stp_hour_readings.client_id = clients.id`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;