const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/invoicingClientIDs&NamesHourly', (req, res) => {
    let sql = `SELECT DISTINCT clients.id, clients.client_name, ident_code FROM clients
    INNER JOIN hour_readings on hour_readings.client_id = clients.id;`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});

router.post('/api/filterData-invoicing-hourly', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp
    } = req.body;

    let sql = `SELECT DISTINCT clients.id, clients.ident_code, clients.client_name, clients.erp_type, '${fromDate}' AS period_from, '${toDate}' AS period_to, COALESCE(
    
        (
    sum(hour_readings.hour_one) + sum(hour_readings.hour_two) + sum(hour_readings.hour_three) + sum(hour_readings.hour_four) + sum(hour_readings.hour_five) + sum(hour_readings.hour_six) + sum(hour_readings.hour_seven) + sum(hour_readings.hour_eight) + sum(hour_readings.hour_nine) + sum(hour_readings.hour_ten) + sum(hour_readings.hour_eleven) + sum(hour_readings.hour_twelve) + sum(hour_readings.hour_thirteen) + sum(hour_readings.hour_fourteen) + sum(hour_readings.hour_fifteen) + sum(hour_readings.hour_sixteen) + sum(hour_readings.hour_seventeen) + sum(hour_readings.hour_eighteen) + sum(hour_readings.hour_nineteen) + sum(hour_readings.hour_twenty) + sum(hour_readings.hour_twentyone) + sum(hour_readings.hour_twentytwo) + sum(hour_readings.hour_twentythree) + sum(hour_readings.hour_zero) 
        ) / 1000,
                                                                                   
       (
     sum(hour_prediction.hour_one) + sum(hour_prediction.hour_two) + sum(hour_prediction.hour_three) + sum(hour_prediction.hour_four) + sum(hour_prediction.hour_five) + sum(hour_prediction.hour_six) + sum(hour_prediction.hour_seven) + sum(hour_prediction.hour_eight) + sum(hour_prediction.hour_nine) + sum(hour_prediction.hour_ten) + sum(hour_prediction.hour_eleven) + sum(hour_prediction.hour_twelve) + sum(hour_prediction.hour_thirteen) + sum(hour_prediction.hour_fourteen) + sum(hour_prediction.hour_fifteen) + sum(hour_prediction.hour_sixteen) + sum(hour_prediction.hour_seventeen) + sum(hour_prediction.hour_eighteen) + sum(hour_prediction.hour_nineteen) + sum(hour_prediction.hour_twenty) + sum(hour_prediction.hour_twentyone) + sum(hour_prediction.hour_twentytwo) + sum(hour_prediction.hour_twentythree) + sum(hour_prediction.hour_zero) 
       )
    ) 
        AS value
        FROM clients
        LEFT JOIN hour_readings ON hour_readings.client_id = clients.id
        LEFT JOIN hour_prediction ON hour_prediction.client_id = clients.id
        WHERE clients.metering_type = '1' `;

    sql += ` AND ((hour_readings.date >= '${fromDate}' AND hour_readings.date <= '${toDate}') OR hour_prediction.date >= '${fromDate}' AND hour_prediction.date <= '${toDate}') `;

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
    sql += ` GROUP BY ident_code`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
module.exports = router;