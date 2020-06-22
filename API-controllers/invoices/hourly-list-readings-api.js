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
    const hourReadingsTable = 'hour_readings';
    const hourPredictionsTable = 'hour_prediction';
    let sql = `SELECT DISTINCT clients.id, clients.ident_code, clients.client_name, clients.erp_type, '${fromDate}' AS period_from, '${toDate}' AS period_to, COALESCE(
    
        (
    sum(IF(${hourReadingsTable}.hour_one = NULL , 0, ${hourReadingsTable}.hour_one)) + sum(IF(${hourReadingsTable}.hour_two = NULL , 0, ${hourReadingsTable}.hour_two)) + sum(IF(${hourReadingsTable}.hour_three = NULL , 0, ${hourReadingsTable}.hour_three)) + sum(IF(${hourReadingsTable}.hour_four = NULL , 0, ${hourReadingsTable}.hour_four)) + sum(IF(${hourReadingsTable}.hour_five = NULL , 0, ${hourReadingsTable}.hour_five)) + sum(IF(${hourReadingsTable}.hour_six = NULL , 0, ${hourReadingsTable}.hour_six)) + sum(IF(${hourReadingsTable}.hour_seven = NULL , 0, ${hourReadingsTable}.hour_seven)) + sum(IF(${hourReadingsTable}.hour_eight = NULL , 0, ${hourReadingsTable}.hour_eight)) + sum(IF(${hourReadingsTable}.hour_nine = NULL , 0, ${hourReadingsTable}.hour_nine)) + sum(IF(${hourReadingsTable}.hour_ten = NULL , 0, ${hourReadingsTable}.hour_ten)) + sum(IF(${hourReadingsTable}.hour_eleven = NULL , 0, ${hourReadingsTable}.hour_eleven)) + sum(IF(${hourReadingsTable}.hour_twelve = NULL , 0, ${hourReadingsTable}.hour_twelve)) + sum(IF(${hourReadingsTable}.hour_thirteen = NULL , 0, ${hourReadingsTable}.hour_thirteen)) + sum(IF(${hourReadingsTable}.hour_fourteen = NULL , 0, ${hourReadingsTable}.hour_fourteen)) + sum(IF(${hourReadingsTable}.hour_fifteen = NULL , 0, ${hourReadingsTable}.hour_fifteen)) + sum(IF(${hourReadingsTable}.hour_sixteen = NULL , 0, ${hourReadingsTable}.hour_sixteen)) + sum(IF(${hourReadingsTable}.hour_seventeen = NULL , 0, ${hourReadingsTable}.hour_seventeen)) + sum(IF(${hourReadingsTable}.hour_eighteen = NULL , 0, ${hourReadingsTable}.hour_eighteen)) + sum(IF(${hourReadingsTable}.hour_nineteen = NULL , 0, ${hourReadingsTable}.hour_nineteen)) + sum(IF(${hourReadingsTable}.hour_twenty = NULL , 0, ${hourReadingsTable}.hour_twenty)) + sum(IF(${hourReadingsTable}.hour_twentyone = NULL , 0, ${hourReadingsTable}.hour_twentyone)) + sum(IF(${hourReadingsTable}.hour_twentytwo = NULL , 0, ${hourReadingsTable}.hour_twentytwo)) + sum(IF(${hourReadingsTable}.hour_twentythree = NULL , 0, ${hourReadingsTable}.hour_twentythree)) + sum(IF(${hourReadingsTable}.hour_zero = NULL , 0, ${hourReadingsTable}.hour_zero)) 
        ) / 1000,
                                                                                    
       (
 sum(IF(${hourPredictionsTable}.hour_one = NULL , 0, ${hourPredictionsTable}.hour_one)) + sum(IF(${hourPredictionsTable}.hour_two = NULL , 0, ${hourPredictionsTable}.hour_two)) + sum(IF(${hourPredictionsTable}.hour_three = NULL , 0, ${hourPredictionsTable}.hour_three)) + sum(IF(${hourPredictionsTable}.hour_four = NULL , 0, ${hourPredictionsTable}.hour_four)) + sum(IF(${hourPredictionsTable}.hour_five = NULL , 0, ${hourPredictionsTable}.hour_five)) + sum(IF(${hourPredictionsTable}.hour_six = NULL , 0, ${hourPredictionsTable}.hour_six)) + sum(IF(${hourPredictionsTable}.hour_seven = NULL , 0, ${hourPredictionsTable}.hour_seven)) + sum(IF(${hourPredictionsTable}.hour_eight = NULL , 0, ${hourPredictionsTable}.hour_eight)) + sum(IF(${hourPredictionsTable}.hour_nine = NULL , 0, ${hourPredictionsTable}.hour_nine)) + sum(IF(${hourPredictionsTable}.hour_ten = NULL , 0, ${hourPredictionsTable}.hour_ten)) + sum(IF(${hourPredictionsTable}.hour_eleven = NULL , 0, ${hourPredictionsTable}.hour_eleven)) + sum(IF(${hourPredictionsTable}.hour_twelve = NULL , 0, ${hourPredictionsTable}.hour_twelve)) + sum(IF(${hourPredictionsTable}.hour_thirteen = NULL , 0, ${hourPredictionsTable}.hour_thirteen)) + sum(IF(${hourPredictionsTable}.hour_fourteen = NULL , 0, ${hourPredictionsTable}.hour_fourteen)) + sum(IF(${hourPredictionsTable}.hour_fifteen = NULL , 0, ${hourPredictionsTable}.hour_fifteen)) + sum(IF(${hourPredictionsTable}.hour_sixteen = NULL , 0, ${hourPredictionsTable}.hour_sixteen)) + sum(IF(${hourPredictionsTable}.hour_seventeen = NULL , 0, ${hourPredictionsTable}.hour_seventeen)) + sum(IF(${hourPredictionsTable}.hour_eighteen = NULL , 0, ${hourPredictionsTable}.hour_eighteen)) + sum(IF(${hourPredictionsTable}.hour_nineteen = NULL , 0, ${hourPredictionsTable}.hour_nineteen)) + sum(IF(${hourPredictionsTable}.hour_twenty = NULL , 0, ${hourPredictionsTable}.hour_twenty)) + sum(IF(${hourPredictionsTable}.hour_twentyone = NULL , 0, ${hourPredictionsTable}.hour_twentyone)) + sum(IF(${hourPredictionsTable}.hour_twentytwo = NULL , 0, ${hourPredictionsTable}.hour_twentytwo)) + sum(IF(${hourPredictionsTable}.hour_twentythree = NULL , 0, ${hourPredictionsTable}.hour_twentythree)) + sum(IF(${hourPredictionsTable}.hour_zero = NULL , 0, ${hourPredictionsTable}.hour_zero))
       )
    ) 
        AS value, IF(is_business = 1,(COALESCE(
    
            (
        sum(IF(${hourReadingsTable}.hour_one = NULL , 0, ${hourReadingsTable}.hour_one)) + sum(IF(${hourReadingsTable}.hour_two = NULL , 0, ${hourReadingsTable}.hour_two)) + sum(IF(${hourReadingsTable}.hour_three = NULL , 0, ${hourReadingsTable}.hour_three)) + sum(IF(${hourReadingsTable}.hour_four = NULL , 0, ${hourReadingsTable}.hour_four)) + sum(IF(${hourReadingsTable}.hour_five = NULL , 0, ${hourReadingsTable}.hour_five)) + sum(IF(${hourReadingsTable}.hour_six = NULL , 0, ${hourReadingsTable}.hour_six)) + sum(IF(${hourReadingsTable}.hour_seven = NULL , 0, ${hourReadingsTable}.hour_seven)) + sum(IF(${hourReadingsTable}.hour_eight = NULL , 0, ${hourReadingsTable}.hour_eight)) + sum(IF(${hourReadingsTable}.hour_nine = NULL , 0, ${hourReadingsTable}.hour_nine)) + sum(IF(${hourReadingsTable}.hour_ten = NULL , 0, ${hourReadingsTable}.hour_ten)) + sum(IF(${hourReadingsTable}.hour_eleven = NULL , 0, ${hourReadingsTable}.hour_eleven)) + sum(IF(${hourReadingsTable}.hour_twelve = NULL , 0, ${hourReadingsTable}.hour_twelve)) + sum(IF(${hourReadingsTable}.hour_thirteen = NULL , 0, ${hourReadingsTable}.hour_thirteen)) + sum(IF(${hourReadingsTable}.hour_fourteen = NULL , 0, ${hourReadingsTable}.hour_fourteen)) + sum(IF(${hourReadingsTable}.hour_fifteen = NULL , 0, ${hourReadingsTable}.hour_fifteen)) + sum(IF(${hourReadingsTable}.hour_sixteen = NULL , 0, ${hourReadingsTable}.hour_sixteen)) + sum(IF(${hourReadingsTable}.hour_seventeen = NULL , 0, ${hourReadingsTable}.hour_seventeen)) + sum(IF(${hourReadingsTable}.hour_eighteen = NULL , 0, ${hourReadingsTable}.hour_eighteen)) + sum(IF(${hourReadingsTable}.hour_nineteen = NULL , 0, ${hourReadingsTable}.hour_nineteen)) + sum(IF(${hourReadingsTable}.hour_twenty = NULL , 0, ${hourReadingsTable}.hour_twenty)) + sum(IF(${hourReadingsTable}.hour_twentyone = NULL , 0, ${hourReadingsTable}.hour_twentyone)) + sum(IF(${hourReadingsTable}.hour_twentytwo = NULL , 0, ${hourReadingsTable}.hour_twentytwo)) + sum(IF(${hourReadingsTable}.hour_twentythree = NULL , 0, ${hourReadingsTable}.hour_twentythree)) + sum(IF(${hourReadingsTable}.hour_zero = NULL , 0, ${hourReadingsTable}.hour_zero)) 
            ) / 1000,
                                                                                        
           (
     sum(IF(${hourPredictionsTable}.hour_one = NULL , 0, ${hourPredictionsTable}.hour_one)) + sum(IF(${hourPredictionsTable}.hour_two = NULL , 0, ${hourPredictionsTable}.hour_two)) + sum(IF(${hourPredictionsTable}.hour_three = NULL , 0, ${hourPredictionsTable}.hour_three)) + sum(IF(${hourPredictionsTable}.hour_four = NULL , 0, ${hourPredictionsTable}.hour_four)) + sum(IF(${hourPredictionsTable}.hour_five = NULL , 0, ${hourPredictionsTable}.hour_five)) + sum(IF(${hourPredictionsTable}.hour_six = NULL , 0, ${hourPredictionsTable}.hour_six)) + sum(IF(${hourPredictionsTable}.hour_seven = NULL , 0, ${hourPredictionsTable}.hour_seven)) + sum(IF(${hourPredictionsTable}.hour_eight = NULL , 0, ${hourPredictionsTable}.hour_eight)) + sum(IF(${hourPredictionsTable}.hour_nine = NULL , 0, ${hourPredictionsTable}.hour_nine)) + sum(IF(${hourPredictionsTable}.hour_ten = NULL , 0, ${hourPredictionsTable}.hour_ten)) + sum(IF(${hourPredictionsTable}.hour_eleven = NULL , 0, ${hourPredictionsTable}.hour_eleven)) + sum(IF(${hourPredictionsTable}.hour_twelve = NULL , 0, ${hourPredictionsTable}.hour_twelve)) + sum(IF(${hourPredictionsTable}.hour_thirteen = NULL , 0, ${hourPredictionsTable}.hour_thirteen)) + sum(IF(${hourPredictionsTable}.hour_fourteen = NULL , 0, ${hourPredictionsTable}.hour_fourteen)) + sum(IF(${hourPredictionsTable}.hour_fifteen = NULL , 0, ${hourPredictionsTable}.hour_fifteen)) + sum(IF(${hourPredictionsTable}.hour_sixteen = NULL , 0, ${hourPredictionsTable}.hour_sixteen)) + sum(IF(${hourPredictionsTable}.hour_seventeen = NULL , 0, ${hourPredictionsTable}.hour_seventeen)) + sum(IF(${hourPredictionsTable}.hour_eighteen = NULL , 0, ${hourPredictionsTable}.hour_eighteen)) + sum(IF(${hourPredictionsTable}.hour_nineteen = NULL , 0, ${hourPredictionsTable}.hour_nineteen)) + sum(IF(${hourPredictionsTable}.hour_twenty = NULL , 0, ${hourPredictionsTable}.hour_twenty)) + sum(IF(${hourPredictionsTable}.hour_twentyone = NULL , 0, ${hourPredictionsTable}.hour_twentyone)) + sum(IF(${hourPredictionsTable}.hour_twentytwo = NULL , 0, ${hourPredictionsTable}.hour_twentytwo)) + sum(IF(${hourPredictionsTable}.hour_twentythree = NULL , 0, ${hourPredictionsTable}.hour_twentythree)) + sum(IF(${hourPredictionsTable}.hour_zero = NULL , 0, ${hourPredictionsTable}.hour_zero))
           )
        )) * 2, 0)
            AS 
            excise 
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