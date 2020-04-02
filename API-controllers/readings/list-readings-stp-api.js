const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');
const NodeTable = require('nodetable');

router.get('/api/daily/stp-hour-reading/:id/:date', (req, res) => {
    let sql = `SELECT *,stp_hour_readings.id AS hrID FROM stp_hour_readings
    INNER JOIN clients on stp_hour_readings.client_id = clients.id
    WHERE stp_hour_readings.date = '${req.params.date}' 
    AND stp_hour_readings.id = '${req.params.id}'
    ORDER BY stp_hour_readings.id
    LIMIT 1`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.post('/api/filter/getAllSTPHourReadingsTable', (req, res) => {
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

    let sql = `SELECT stp_hour_readings.id, clients.id as cId,clients.ident_code, 
    clients.client_name, clients.erp_type, stp_hour_readings.date,
     ( hour_one + hour_two + hour_three + hour_four + hour_five + hour_six + hour_seven + hour_eight + hour_nine + hour_ten + hour_eleven+ hour_twelve + hour_thirteen + hour_fourteen + hour_fifteen + hour_sixteen + hour_seventeen + hour_eighteen + hour_nineteen + hour_twenty + hour_twentyone + hour_twentytwo + hour_twentythree + hour_zero) as amount 
    FROM stp_hour_readings
    INNER JOIN clients ON clients.id = stp_hour_readings.client_id 
    WHERE 1=1 `;
    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND stp_hour_readings.date >= '${fromDate}' AND stp_hour_readings.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND stp_hour_readings.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND stp_hour_readings.date <= '${toDate}' `;
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
    search.value ? sql += ` AND '${search.value}' IN (stp_hour_readings.id, clients.ident_code, 
        clients.client_name, clients.erp_type, stp_hour_readings.date, ( hour_one + hour_two + hour_three + hour_four + hour_five + hour_six + hour_seven + hour_eight + hour_nine + hour_ten + hour_eleven+ hour_twelve + hour_thirteen + hour_fourteen + hour_fifteen + hour_sixteen + hour_seventeen + hour_eighteen + hour_nineteen + hour_twenty + hour_twentyone + hour_twentytwo + hour_twentythree + hour_zero)) ` : '';
    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }

        return res.send(JSON.stringify(result));
    });
});

function getColumnType(columnNum) {
    let result = 'stp_hour_readings.id';

    switch (columnNum) {
        case '0':
            result = 'stp_hour_readings.id'
            break;
        case '1':
            result = 'clients.ident_code'
            break;
        case '2':
            result = 'clients.client_name'
            break;
        case '3':
            result = 'stp_hour_readings.date'
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

module.exports = router;