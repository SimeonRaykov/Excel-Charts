const express = require('express');
const router = express.Router();
const {
    db
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
        search,
        start,
        length,
        order,
        fromDate,
        toDate,
        name,
        ident_code,
        erp
    } = req.body;
    const columnNum = order[0].column;
    const columnType = getInvoicingColumnType(columnNum)
    const orderType = order[0].dir;

    let sql = `SELECT clients.id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.time_zone, invoicing.id AS invoicing_id,client_number, ident_code, qty, period_from, period_to, value_bgn, type
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(invoicing.id) AS count
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(invoicing.id) AS count
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE 1=1 `;

    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND invoicing.period_from >= '${fromDate}' AND invoicing.period_to <= '${toDate}' `;
        countFilteredSql += ` AND invoicing.period_from >= '${fromDate}' AND invoicing.period_to <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND invoicing.period_from >= '${fromDate}' `;
        countFilteredSql += ` AND invoicing.period_from >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND invoicing.period_to <= '${toDate}' `;
        countFilteredSql += ` AND invoicing.period_to <= '${toDate}' `;
    }

    if (name != '' && name != undefined) {
        sql += ` AND clients.client_name LIKE '%${name}%'`;
        countFilteredSql += ` AND clients.client_name LIKE '%${name}%'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND clients.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND clients.erp_type = '${erp}'`;
            countFilteredSql += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( clients.erp_type = '${erp[0]}'`;
            sql += ` OR clients.erp_type = '${erp[1]}' )`;
            countFilteredSql += ` AND ( clients.erp_type = '${erp[0]}'`;
            countFilteredSql += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }
    if (search.value) {
        sql += `  AND (client_name LIKE '%${search.value}%' OR ident_code LIKE '%${search.value}%') `
        countFilteredSql += ` AND (client_name LIKE '%${search.value}%' OR ident_code LIKE '%${search.value}%') `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;

    const countSQL = countTotalSql + ' UNION ' + countFilteredSql;
    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const recordsTotal = countTotal[0].count;
            const recordsFiltered = countTotal[1] ? countTotal[1].count : countTotal[0].count
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});
 
function getInvoicingColumnType(columnNum) {
    let result = 'invoicing.id';

    switch (columnNum) {
        case '0':
            result = 'invoicing.id'
            break;
        case '1':
            result = 'clients.client_number'
            break;
        case '2':
            result = 'clients.ident_code'
            break;
        case '3':
            result = 'invoicing.period_from'
            break;
        case '4':
            result = 'invoicing.period_to'
            break;
        case '5':
            result = 'invoicing.time_zone'
            break;
        case '6':
            result = 'invoicing.qty'
            break;
        case '7':
            result = 'invoicing.value_bgn'
            break;
        case '8':
            result = 'invoicing.type'
            break;
        case '9':
            result = 'invoicing.operator'
            break;
    }
    return result
}

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