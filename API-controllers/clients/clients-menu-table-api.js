const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/getAllClients', (req, res) => {
    
    let sql = `SELECT clients.id, client_name, ident_code, metering_type FROM clients`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        res.send(result);
    });
});

router.get('/api/filterClients/:erp_type/:metering_type', (req, res) => {
    let erpType = req.params.erp_type;
    let meteringType = req.params.metering_type;
    let sql = `SELECT clients.id, client_name, ident_code, metering_type, erp_type FROM clients
    WHERE 1=1 `;
    if (erpType != 'all') {
        if (erpType.length == 1) {
            sql += ` AND erp_type = ${erpType}`;
        } else if (erpType.split(',').length == 2) {
            sql += `  AND ( erp_type = ${erpType.split(',')[0]}`;
            sql += ` OR erp_type = ${erpType.split(',')[1]} )`;
        }

    }
    if (meteringType != 'all') {
        if (meteringType.length != 2) {
            sql += ` AND metering_type = ${meteringType}`;
        }
    }

    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        res.send(result);
    });
});

router.get('/api/data-listings/all-clients', (req, res) => {
    let sql = `SELECT DISTINCT clients.ident_code, clients.client_name
     FROM clients`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;