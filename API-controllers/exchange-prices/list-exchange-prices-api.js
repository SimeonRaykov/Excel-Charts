const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/exchange-prices-readings', (req, res) => {
    let {
        search,
        start,
        length,
        order,
        fromDate,
        toDate,
    } = req.body;
    const mainTable = 'exchange_prices';
    const columnNum = order[0].column;
    const columnType = getColumnType(columnNum, mainTable)
    const orderType = order[0].dir;

    let sql = `SELECT ${mainTable}.id, ${mainTable}.date
    FROM ${mainTable}
    WHERE 1 = 1 `;
    let countTotalSql = `SELECT COUNT(${mainTable}.id) as countTotal
    FROM ${mainTable} 
    WHERE 1 = 1 `;
    let countFilteredSql = `SELECT COUNT(${mainTable}.id) as countFiltered
    FROM ${mainTable}
    WHERE 1 = 1 `;

    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND ${mainTable}.date >= '${fromDate}' AND ${mainTable}.date <= '${toDate}' `;
        countFilteredSql += ` AND ${mainTable}.date >= '${fromDate}' AND ${mainTable}.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND ${mainTable}.date >= '${fromDate}' `;
        countFilteredSql += ` AND ${mainTable}.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND ${mainTable}.date <= '${toDate}' `;
        countFilteredSql += ` AND ${mainTable}.date <= '${toDate}' `;
    }

    if (search.value) {
        sql += `  AND (${mainTable}.date = '%${search.value}%') `
        countFilteredSql += `  AND (${mainTable}.date = '%${search.value}%') `
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

function getColumnType(columnNum, table) {
    const clientsTable = 'clients';
    let result = `${table}.id`;

    switch (columnNum) {
        case '0':
            result = `${table}.id`;
            break;
        case '1':
            result = `${table}.date`;
            break;
    }
    return result
}

module.exports = router;