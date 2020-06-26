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

router.post('/api/filter/exchange-prices-hourly-readings/', (req, res) => {
    let {
        fromDate,
        toDate,
    } = req.body;
    const mainTable = 'exchange_prices';

    let sql = `SELECT ${mainTable}.id, ${mainTable}.date, ${mainTable}.hour_zero AS 'hr0', ${mainTable}.hour_one AS 'hr1', ${mainTable}.hour_two AS 'hr2', ${mainTable}.hour_three AS 'hr3', ${mainTable}.hour_four AS 'hr4', ${mainTable}.hour_five AS 'hr5', ${mainTable}.hour_six AS 'hr6', ${mainTable}.hour_seven AS 'hr7', ${mainTable}.hour_eight AS 'hr8', ${mainTable}.hour_nine AS 'hr9', ${mainTable}.hour_ten AS 'hr10', ${mainTable}.hour_eleven AS 'hr11', ${mainTable}.hour_twelve AS 'hr12', ${mainTable}.hour_thirteen AS 'hr13', ${mainTable}.hour_fourteen AS 'hr14', ${mainTable}.hour_fifteen AS 'hr15' , ${mainTable}.hour_sixteen AS 'hr16', ${mainTable}.hour_seventeen AS 'hr17', ${mainTable}.hour_eighteen AS 'hr18', ${mainTable}.hour_nineteen AS 'hr19', ${mainTable}.hour_twenty AS 'hr20', ${mainTable}.hour_twentyone AS 'hr21', ${mainTable}.hour_twentytwo AS 'hr22', ${mainTable}.hour_twentythree AS 'hr23'
    FROM ${mainTable}
    WHERE 1 = 1 `;

    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND ${mainTable}.date >= '${fromDate}' AND ${mainTable}.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND ${mainTable}.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND ${mainTable}.date <= '${toDate}' `;
    }

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
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