const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/getAllHourReadingsTable', (req, res) => {
    let {
        date,
        name,
        ident_code,
        erp
    } = req.body;

    let sql = `SELECT hour_readings.id, clients.id as cId,clients.ident_code, clients.client_name, clients.erp_type, hour_readings.date, ( hour_one + hour_two + hour_three + hour_four + hour_five + hour_six + hour_seven + hour_eight + hour_nine + hour_ten + hour_eleven+ hour_twelve + hour_thirteen + hour_fourteen + hour_fifteen + hour_sixteen + hour_seventeen + hour_eighteen + hour_nineteen + hour_twenty + hour_twentyone + hour_twentytwo + hour_twentythree + hour_zero) as amount FROM hour_readings
    INNER JOIN clients ON clients.id = hour_readings.client_id 
    WHERE 1=1 `;
    if (date != '' && date != undefined) {
        sql += ` AND hour_readings.date = '${date}' `
    }
    if (name != '' && name != undefined) {
        sql += ` AND clients.client_name LIKE '%${name}%'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        console.log('3');
        if (erp.length == 1) {
            sql += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( clients.erp_type = '${erp[0]}'`;
            sql += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        console.log('undefined');
        return res.send(JSON.stringify([]));
    }
    sql += ' ORDER BY hour_readings.id';
    console.log(sql);
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
module.exports = router;