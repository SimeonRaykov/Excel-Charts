const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/data-listings/imbalances', (req, res) => {
    let sql = `(SELECT clients.ident_code, clients.client_name
        FROM clients
        WHERE metering_type = 2
        )
        UNION
        (SELECT clients.ident_code, clients.client_name FROM clients 
         WHERE metering_type = 1)`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.post('/api/filter/calculate-imbalances/', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        metering_type
    } = req.body;

    let sql;
    if (metering_type == 'hourly_imbalances') {
        sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_zero AS 'hr0',hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'phr0', hour_prediction.hour_one AS 'phr1',  hour_prediction.hour_two AS 'phr2', hour_prediction.hour_three AS 'phr3', hour_prediction.hour_four AS 'phr4', hour_prediction.hour_five AS 'phr5', hour_prediction.hour_six AS 'phr6', hour_prediction.hour_seven AS 'phr7', hour_prediction.hour_eight AS 'phr8', hour_prediction.hour_nine AS 'phr9', hour_prediction.hour_ten AS 'phr10', hour_prediction.hour_eleven AS 'phr11', hour_prediction.hour_twelve AS 'phr12', hour_prediction.hour_thirteen AS 'phr13', hour_prediction.hour_fourteen AS 'phr14', hour_prediction.hour_fifteen AS 'phr15', hour_prediction.hour_sixteen AS 'phr16', hour_prediction.hour_seventeen AS 'phr17', hour_prediction.hour_eighteen AS 'phr18', hour_prediction.hour_nineteen AS 'phr19', hour_prediction.hour_twenty AS 'phr20', hour_prediction.hour_twentyone AS 'phr21', hour_prediction.hour_twentytwo AS 'phr22', hour_prediction.hour_twentythree AS 'phr23', is_manufacturer FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id  
     INNER JOIN hour_prediction on hour_prediction.client_id = clients.id 
     WHERE 1=1 `;
        if (fromDate != -1 && toDate != -1) {
            sql += ` AND hour_prediction.date>='${fromDate}' AND hour_prediction.date<= '${toDate}' `;
        } else if (fromDate != -1 && toDate == -1) {
            sql += ` AND hour_prediction.date>='${fromDate}' `;
        } else if (toDate != -1 && fromDate == -1) {
            sql += ` AND hour_prediction.date<='${toDate}' `;
        }
        if (name != -1) {
            sql += ` AND clients.client_name = '${name}' `
        }
        if (ident_code != -1) {
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
        sql += ` GROUP BY hour_prediction.date`;
    } else if (metering_type === 'stp_imbalances') {
        sql = `SELECT clients.ident_code,profile_coef.date, amount, stp_hour_readings.hour_zero AS 'hr0',stp_hour_readings.hour_one AS 'hr1',  stp_hour_readings.hour_two AS 'hr2', stp_hour_readings.hour_three AS 'hr3', stp_hour_readings.hour_four AS 'hr4', stp_hour_readings.hour_five AS 'hr5', stp_hour_readings.hour_six AS 'hr6', stp_hour_readings.hour_seven AS 'hr7', stp_hour_readings.hour_eight AS 'hr8', stp_hour_readings.hour_nine AS 'hr9', stp_hour_readings.hour_ten AS 'hr10', stp_hour_readings.hour_eleven AS 'hr11', stp_hour_readings.hour_twelve AS 'hr12', stp_hour_readings.hour_thirteen AS 'hr13', stp_hour_readings.hour_fourteen AS 'hr14', stp_hour_readings.hour_fifteen AS 'hr15', stp_hour_readings.hour_sixteen AS 'hr16', stp_hour_readings.hour_seventeen AS 'hr17', stp_hour_readings.hour_eighteen AS 'hr18', stp_hour_readings.hour_nineteen AS 'hr19', stp_hour_readings.hour_twenty AS 'hr20', stp_hour_readings.hour_twentyone AS 'hr21', stp_hour_readings.hour_twentytwo AS 'hr22', stp_hour_readings.hour_twentythree AS 'hr23',
     profile_coef.hour_zero AS 'phr0', profile_coef.hour_one AS 'phr1', profile_coef.hour_two AS 'phr2', profile_coef.hour_three AS 'phr3', profile_coef.hour_four AS 'phr4', profile_coef.hour_five AS 'phr5', profile_coef.hour_six AS 'phr6', profile_coef.hour_seven AS 'phr7', profile_coef.hour_eight AS 'phr8', profile_coef.hour_nine AS 'phr9', profile_coef.hour_ten AS 'phr10', profile_coef.hour_eleven AS 'phr11', profile_coef.hour_twelve AS 'phr12', profile_coef.hour_thirteen AS 'phr13', profile_coef.hour_fourteen AS 'phr14', profile_coef.hour_fifteen AS 'phr15', profile_coef.hour_sixteen AS 'phr16', profile_coef.hour_seventeen AS 'phr17', profile_coef.hour_eighteen AS 'phr18', profile_coef.hour_nineteen AS 'phr19', profile_coef.hour_twenty AS 'phr20', profile_coef.hour_twentytwo AS 'phr21', profile_coef.hour_twentytwo AS 'phr22', profile_coef.hour_twentythree AS 'phr23', is_manufacturer FROM clients
    INNER JOIN stp_hour_readings ON clients.id = stp_hour_readings.client_id 
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE MONTH(prediction.date) = MONTH(profile_coef.date)
    AND YEAR(prediction.date) = YEAR(profile_coef.date)
    AND profile_coef.date = stp_hour_readings.date `

        if (fromDate != -1 && toDate != -1) {
            sql += `AND profile_coef.date>='${fromDate}' AND profile_coef.date<= '${toDate}' `;
        } else if (fromDate != -1 && toDate == -1) {
            sql += `AND profile_coef.date>='${fromDate}' `;
        } else if (toDate != -1 && fromDate == -1) {
            sql += `AND profile_coef.date<='${toDate}' `;
        }
        if (name != -1) {
            sql += ` AND clients.client_name = '${name}' `
        }
        if (ident_code != -1) {
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
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        //console.log(result);
        //  Mock Data 
        /* let arrResults = [];
        arrResults.push(result[0], result[0], result[0]);
        return res.send(JSON.stringify(arrResults)); */
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;