const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/list-stp-graph-readings', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp
    } = req.body;

    let sql = `SELECT prediction.id, clients.id as cId,clients.ident_code, clients.client_name, clients.erp_type, prediction.date, prediction.amount FROM prediction
    INNER JOIN clients ON clients.id = prediction.client_id 
    WHERE 1=1 `;
    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND prediction.date >= '${fromDate}' AND prediction.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND prediction.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND prediction.date <= '${toDate}' `;
    }
    if (name != '' && name != undefined) {
        sql += ` AND clients.client_name LIKE '%${name}%'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( clients.erp_type = '${erp[0]}'`;
            sql += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }
    sql += ' ORDER BY prediction.id';
    let rex = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(rex.sql)
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/data-listings/graphs-stp-readings', (req, res) => {
    let sql = `SELECT DISTINCT clients.ident_code, clients.client_name
     FROM clients
     INNER JOIN prediction on prediction.client_id = clients.id`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;