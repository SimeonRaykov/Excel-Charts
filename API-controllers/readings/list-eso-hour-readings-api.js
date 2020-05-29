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
        client_name,
        ident_code,
        type
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnType(columnNum, 'readings')
    const orderType = order[0].dir;

    let sql = `SELECT clients.id as cId, hour_readings_eso.id, hour_readings_eso.date, clients.client_name, clients.ident_code,
    hour_readings_eso.type
    FROM hour_readings_eso 
    INNER JOIN clients ON clients.id = hour_readings_eso.client_id
    WHERE 1 = 1 `;
    let countTotalSql = `SELECT COUNT(hour_readings_eso.id) as countTotal
    FROM hour_readings_eso 
    INNER JOIN clients ON clients.id = hour_readings_eso.client_id
    WHERE 1 = 1 `;
    let countFilteredSql = `SELECT COUNT(hour_readings_eso.id) as countFiltered
    FROM hour_readings_eso
    INNER JOIN clients ON clients.id = hour_readings_eso.client_id 
    WHERE 1 = 1 `;

    if (client_name != '' && client_name != undefined) {
        sql += ` AND clients.client_name LIKE '%${client_name}%'`;
        countFilteredSql += ` AND clients.client_name LIKE '%${client_name}%'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND clients.ident_code = '${ident_code}'`;
    }

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
        sql += `  AND (hour_readings_eso.date = '%${search.value}%' OR clients.ident_code LIKE '%${search.value}%' OR clients.client_name LIKE '%${search.value}%' ) `
        countFilteredSql += `  AND (hour_readings_eso.date = '%${search.value}%' OR clients.ident_code LIKE '%${search.value}%' OR clients.client_name LIKE '%${search.value}%'  ) `
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

router.post('/api/filter/eso-graph-readings', (req, res) => {
    let {
        search,
        start,
        length,
        order,
        fromDate,
        toDate,
        client_name,
        ident_code,
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnType(columnNum, 'graphs')
    const orderType = order[0].dir;

    let sql = `SELECT clients.id as cId, hour_prediction_eso.id, hour_prediction_eso.date, clients.client_name, clients.ident_code
    FROM hour_prediction_eso
    INNER JOIN clients ON clients.id = hour_prediction_eso.client_id
    WHERE 1 = 1 `;
    let countTotalSql = `SELECT COUNT(hour_prediction_eso.id) as countTotal
    FROM hour_prediction_eso
    INNER JOIN clients ON clients.id = hour_prediction_eso.client_id
    WHERE 1 = 1 `;
    let countFilteredSql = `SELECT COUNT(hour_prediction_eso.id) as countFiltered
    FROM hour_prediction_eso
    INNER JOIN clients ON clients.id = hour_prediction_eso.client_id 
    WHERE 1 = 1 `;

    if (client_name != '' && client_name != undefined) {
        sql += ` AND clients.client_name LIKE '%${client_name}%'`;
        countFilteredSql += ` AND clients.client_name LIKE '%${client_name}%'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND clients.ident_code = '${ident_code}'`;
    }

    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND hour_prediction_eso.date >= '${fromDate}' AND hour_prediction_eso.date <= '${toDate}' `;
        countFilteredSql += ` AND hour_prediction_eso.date >= '${fromDate}' AND hour_prediction_eso.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND hour_prediction_eso.date >= '${fromDate}' `;
        countFilteredSql += ` AND hour_prediction_eso.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND hour_prediction_eso.date <= '${toDate}' `;
        countFilteredSql += ` AND hour_prediction_eso.date <= '${toDate}' `;
    }
    if (search.value) {
        sql += `  AND (hour_prediction_eso.date = '%${search.value}%' OR clients.ident_code LIKE '%${search.value}%' OR clients.client_name LIKE '%${search.value}%' ) `
        countFilteredSql += `  AND (hour_prediction_eso.date = '%${search.value}%' OR clients.ident_code LIKE '%${search.value}%' OR clients.client_name LIKE '%${search.value}%'  ) `
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

function getColumnType(columnNum, type) {
    let table;
    const clientsTable = 'clients';
    if (type == 'graphs') {
        table = 'hour_prediction_eso';
    } else if (type == 'readings') {
        table = 'hour_readings_eso';
    }
    let result = `${table}.id`;

    switch (columnNum) {
        case '0':
            result = `${table}.id`;
            break;
        case '1':
            result = `${clientsTable}.ident_code`;
            break;
        case '2':
            result = `${clientsTable}.client_name`;
            break;
        case '3':
            result = `${table}.date`;
            break;
        case '4':
            result = `${table}.type`;
            break;
    }
    return result
}

module.exports = router;