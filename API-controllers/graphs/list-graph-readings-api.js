const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/list-readings-graph/', (req, res) => {
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

    let sql = `SELECT hour_prediction.id, clients.id as cId,clients.ident_code, clients.client_name, clients.erp_type, hour_prediction.date, ( hour_one + hour_two + hour_three + hour_four + hour_five + hour_six + hour_seven + hour_eight + hour_nine + hour_ten + hour_eleven+ hour_twelve + hour_thirteen + hour_fourteen + hour_fifteen + hour_sixteen + hour_seventeen + hour_eighteen + hour_nineteen + hour_twenty + hour_twentyone + hour_twentytwo + hour_twentythree + hour_zero) as amount FROM hour_prediction
    INNER JOIN clients ON clients.id = hour_prediction.client_id 
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(hour_prediction.id) as countTotal FROM hour_prediction
    INNER JOIN clients ON clients.id = hour_prediction.client_id
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(hour_prediction.id) as countFiltered FROM hour_prediction
    INNER JOIN clients ON clients.id = hour_prediction.client_id
    WHERE 1=1 `;
    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND hour_prediction.date >= '${fromDate}' AND hour_prediction.date <= '${toDate}' `;
        countFilteredSql += ` AND hour_prediction.date >= '${fromDate}' AND hour_prediction.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND hour_prediction.date >= '${fromDate}' `;
        countFilteredSql += ` AND hour_prediction.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND hour_prediction.date <= '${toDate}' `;
        countFilteredSql += ` AND hour_prediction.date <= '${toDate}' `;
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
    let result = 'hour_prediction.id';

    switch (columnNum) {
        case '0':
            result = 'hour_prediction.id'
            break;
        case '1':
            result = 'clients.ident_code'
            break;
        case '2':
            result = 'clients.client_name'
            break;
        case '3':
            result = 'hour_prediction.date'
            break;
        case '4':
            result = 'clients.erp_type'
            break;
        case '5':
            result = 'amount'
            break;
    }
    return result
}

router.get('/api/data-listings/graphs-readings', (req, res) => {
    let sql = `SELECT DISTINCT clients.ident_code, clients.client_name
     FROM clients
     INNER JOIN hour_prediction on hour_prediction.client_id = clients.id`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;