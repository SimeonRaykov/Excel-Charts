const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/eso-hour-readings', (req, res) => {
    let {
        search,
        start,
        length,
        order,
        fromDate,
        toDate,
        type
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnType(columnNum)
    const orderType = order[0].dir;
    let sql = `SELECT hour_readings_eso.id, hour_readings_eso.date, 
    hour_readings_eso.type
    FROM hour_readings_eso 
    WHERE 1 = 1 `;
    let countTotalSql = `SELECT COUNT(hour_readings_eso.id) as countTotal
    FROM hour_readings_eso 
    WHERE 1 = 1 `;
    let countFilteredSql = `SELECT COUNT(hour_readings_eso.id) as countFiltered
    FROM hour_readings_eso 
    WHERE 1 = 1 `;
    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND hour_readings_eso.date >= '${fromDate}' AND hour_readings_eso.date <= '${toDate}' `;
        countFilteredSql += ` AND hour_readings_eso.date >= '${fromDate}' AND hour_readings_eso.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND hour_readings_eso.date >= '${fromDate}' `;
        countFilteredSql += ` AND hour_readings_eso.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND hour_readings_eso.date <= '${toDate}' `;
        countFilteredSql += ` AND hour_readings_eso.date <= '${toDate}' `;
    }
    if (type && type.length === 1) {
        sql += ` AND hour_readings_eso.type = '${type}'`;
        countFilteredSql += ` AND hour_readings_eso.type = '${type}' `;
    } else if (type == undefined) {
        return res.send(JSON.stringify([]));
    }
    if (search.value) {
        sql += `  AND (hour_readings_eso.date = '%${search.value}%' ) `

        countFilteredSql += `  AND (hour_readings_eso.date = '%${search.value}%'  ) `
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
    let result = 'hour_readings_eso.id';

    switch (columnNum) {
        case '0':
            result = 'hour_readings_eso.id'
            break;
        case '1':
            result = 'hour_readings_eso.date'
            break;
        case '2':
            result = 'hour_readings_eso.type'
            break;
    }
    return result
}

module.exports = router;