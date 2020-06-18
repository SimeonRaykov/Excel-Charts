const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.get('/invoicingClientIDs&NamesSTP', (req, res) => {
    let sql = `SELECT DISTINCT clients.id, clients.client_name, ident_code FROM clients
    INNER JOIN invoicing on invoicing.client_id = clients.id;`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});
router.post('/api/filterData-invoicing-stp', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp
    } = req.body;

    let searchIDsSQL = `SELECT DISTINCT invoicing.client_id AS id
    FROM invoicing
    INNER JOIN clients ON clients.id = invoicing.client_id
    WHERE 1=1 `;

    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        searchIDsSQL += ` AND invoicing.period_from >= '${fromDate}' AND invoicing.period_to <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        searchIDsSQL += ` AND invoicing.period_from >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        searchIDsSQL += ` AND invoicing.period_to <= '${toDate}' `;
    }

    if (name != '' && name != undefined) {
        searchIDsSQL += ` AND clients.client_name LIKE '%${name}%'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        searchIDsSQL += ` AND clients.ident_code = '${ident_code}'`;
    }

    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            searchIDsSQL += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            searchIDsSQL += ` AND ( clients.erp_type = '${erp[0]}'`;
            searchIDsSQL += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }
    const clientIDs = dbSync.query(searchIDsSQL);
    if (clientIDs[0]) {
        let currClientID = clientIDs[0].id;
        let sql = `SELECT DISTINCT clients.id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.time_zone, 
        invoicing.id AS invoicing_id,client_number, ident_code, MIN(period_from) AS period_from, MAX(period_to) AS period_to, type,
        (SELECT SUM(qty) FROM invoicing
        INNER JOIN clients ON clients.id = invoicing.client_id
        WHERE service LIKE "%Достъп до разпред. мрежа%" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}') AS service, 
            (SELECT SUM(diff)
            FROM invoicing
            INNER JOIN clients ON clients.id = invoicing.client_id
            WHERE time_zone = "А Н" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
        ) AS diff_night,
            (SELECT SUM(diff)
            FROM invoicing
            INNER JOIN clients ON clients.id = invoicing.client_id
            WHERE time_zone = "А Д" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
        ) AS diff_day,
        (SELECT SUM(diff)
            FROM invoicing
            INNER JOIN clients ON clients.id = invoicing.client_id
            WHERE time_zone = "А В" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
        ) AS diff_peak,
        (SELECT SUM(diff)
            FROM invoicing
            INNER JOIN clients ON clients.id = invoicing.client_id
            WHERE time_zone = "А Е" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
        ) AS diff_single
            FROM invoicing
            INNER JOIN clients ON invoicing.client_id = clients.id
            WHERE invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}' 
            GROUP BY ident_code`;
        for (let i = 1; i < clientIDs.length; i += 1) {
            currClientID = clientIDs[i].id;
            sql += ` UNION SELECT DISTINCT clients.id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.time_zone, 
         invoicing.id AS invoicing_id,client_number, ident_code, MIN(period_from) as period_from, MAX(period_to) as period_to, type, 
         (SELECT SUM(qty) FROM invoicing
        INNER JOIN clients ON clients.id = invoicing.client_id
        WHERE service LIKE "%Достъп до разпред. мрежа%" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}') AS service,
             (SELECT SUM(diff)
             FROM invoicing
             INNER JOIN clients ON clients.id = invoicing.client_id
             WHERE time_zone = "А Н" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
         ) AS diff_night,
             (SELECT SUM(diff)
             FROM invoicing
             INNER JOIN clients ON clients.id = invoicing.client_id
             WHERE time_zone = "А Д" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
         ) AS diff_day,
         (SELECT SUM(diff)
             FROM invoicing
             INNER JOIN clients ON clients.id = invoicing.client_id
             WHERE time_zone = "А В" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
         ) AS diff_peak,
         (SELECT SUM(diff)
             FROM invoicing
             INNER JOIN clients ON clients.id = invoicing.client_id
             WHERE time_zone = "А Е" AND invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
         ) AS diff_single
             FROM invoicing
             INNER JOIN clients ON invoicing.client_id = clients.id
             WHERE invoicing.period_from >= "${fromDate}" AND invoicing.period_to <= "${toDate}" AND invoicing.client_id = '${currClientID}'
             GROUP BY ident_code`
        }

        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            result = result.map(obj => ({
                ...obj,
                total: Number(obj.diff_night) + Number(obj.diff_day) + Number(obj.diff_peak) + Number(obj.diff_single),
                duty: (Number(obj.diff_night) + Number(obj.diff_day) + Number(obj.diff_peak) + Number(obj.diff_single)) * 2
            }))
            return res.send(JSON.stringify(result));
        })
    } else {
        return res.send(JSON.stringify([]));
    }
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

router.post('/api/filter/invoices-stp', (req, res) => {
    let {
        IDs
    } = req.body;

    let sql = `SELECT invoicing.id AS invoicing_id, clients.ident_code, period_from, period_to, qty, value_bgn
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE invoicing.id IN (${IDs})`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
})

module.exports = router;