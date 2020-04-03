const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/list-stp-graph-readings', (req, res) => {
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
    const columnType = getColumnType(columnNum)
    const orderType = order[0].dir;

    let sql = `SELECT prediction.id, clients.id as cId,clients.ident_code, clients.client_name, clients.erp_type, prediction.date, prediction.amount FROM prediction
    INNER JOIN clients ON clients.id = prediction.client_id 
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(prediction.id) as countTotal FROM prediction
    INNER JOIN clients ON clients.id = prediction.client_id
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(prediction.id) as countFiltered FROM prediction
    INNER JOIN clients ON clients.id = prediction.client_id
    WHERE 1=1 `;
    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND prediction.date >= '${fromDate}' AND prediction.date <= '${toDate}' `;
        countFilteredSql += ` AND prediction.date >= '${fromDate}' AND prediction.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND prediction.date >= '${fromDate}' `;
        countFilteredSql += ` AND prediction.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND prediction.date <= '${toDate}' `;
        countFilteredSql += ` AND prediction.date <= '${toDate}' `;
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
        sql += ` AND '${search.value}' IN (prediction.id, clients.ident_code, 
        clients.client_name, clients.erp_type, prediction.date, prediction.amount) `;
        countFilteredSql += ` AND '${search.value}' IN (prediction.id, clients.ident_code, 
            clients.client_name, clients.erp_type, prediction.date, prediction.amount) `;
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
            const recordsTotal = countTotal[0].countTotal;
            const recordsFiltered = countTotal[1] ? countTotal[1].countTotal : countTotal[0].countTotal
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});

function getColumnType(columnNum) {
    let result = 'prediction.id';

    switch (columnNum) {
        case '0':
            result = 'prediction.id'
            break;
        case '1':
            result = 'clients.ident_code'
            break;
        case '2':
            result = 'clients.client_name'
            break;
        case '3':
            result = 'prediction.date'
            break;
        case '4':
            result = 'clients.erp_type'
            break;
        case '5':
            result = 'prediction.amount'
            break;
    }
    return result
}

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