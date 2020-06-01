const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.get('/api/eso-hour-readings-clients/:fromDate/:toDate/:clientID', (req, res) => {
    const {
        fromDate,
        toDate,
        clientID
    } = req.params;
    const hoursTable = 'hour_readings_eso';
    let sql = `SELECT clients.ident_code, ${hoursTable}.date, ${hoursTable}.hour_zero AS hr1,  ${hoursTable}.hour_one AS 'hr2', ${hoursTable}.hour_two AS 'hr3', ${hoursTable}.hour_three AS 'hr4', ${hoursTable}.hour_four AS 'hr5', ${hoursTable}.hour_five AS 'hr6', ${hoursTable}.hour_six AS 'hr7', ${hoursTable}.hour_seven AS 'hr8', ${hoursTable}.hour_eight AS 'hr9', ${hoursTable}.hour_nine AS 'hr10', ${hoursTable}.hour_ten AS 'hr11', ${hoursTable}.hour_eleven AS 'hr12', ${hoursTable}.hour_twelve AS 'hr13', ${hoursTable}.hour_thirteen AS 'hr14', ${hoursTable}.hour_fourteen AS 'hr15', ${hoursTable}.hour_fifteen AS 'hr16', ${hoursTable}.hour_sixteen AS 'hr17', ${hoursTable}.hour_seventeen AS 'hr18', ${hoursTable}.hour_eighteen AS 'hr19', ${hoursTable}.hour_nineteen AS 'hr20', ${hoursTable}.hour_twenty AS 'hr21', ${hoursTable}.hour_twentyone AS 'hr22', ${hoursTable}.hour_twentytwo AS 'hr23', ${hoursTable}.hour_twentythree AS 'hr24'FROM clients
    INNER JOIN ${hoursTable} on clients.id = ${hoursTable}.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/eso-graph-predictions-clients/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;

    const hoursTable = `hour_prediction_eso`;
    let sql = `SELECT clients.ident_code, ${hoursTable}.date, ${hoursTable}.hour_zero AS 'hr1',  ${hoursTable}.hour_one AS 'hr2', ${hoursTable}.hour_two AS 'hr3', ${hoursTable}.hour_three AS 'hr4', ${hoursTable}.hour_four AS 'hr5', ${hoursTable}.hour_five AS 'hr6', ${hoursTable}.hour_six AS 'hr7', ${hoursTable}.hour_seven AS 'hr8', ${hoursTable}.hour_eight AS 'hr9', ${hoursTable}.hour_nine AS 'hr10', ${hoursTable}.hour_ten AS 'hr11', ${hoursTable}.hour_eleven AS 'hr12', ${hoursTable}.hour_twelve AS 'hr13', ${hoursTable}.hour_thirteen AS 'hr14', ${hoursTable}.hour_fourteen AS 'hr15', ${hoursTable}.hour_fifteen AS 'hr16', ${hoursTable}.hour_sixteen AS 'hr17', ${hoursTable}.hour_seventeen AS 'hr18', ${hoursTable}.hour_eighteen AS 'hr19', ${hoursTable}.hour_nineteen AS 'hr20', ${hoursTable}.hour_twenty AS 'hr21', ${hoursTable}.hour_twentyone AS 'hr22', ${hoursTable}.hour_twentytwo AS 'hr23', ${hoursTable}.hour_twentythree AS 'hr24'FROM clients
    INNER JOIN ${hoursTable} on clients.id = ${hoursTable}.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/eso-imbalances-clients/getClient/:fromDate/:toDate/:id', (req, res) => {
    const {
        fromDate,
        toDate
    } = req.params;
    const clientID = req.params.id;
    const readingHoursTable = 'hour_readings_eso';
    const predictionsHoursTable = 'hour_prediction_eso';
    // Type = 1 Небаланс за произведена енергия 
    let sql = `SELECT clients.ident_code, ${readingHoursTable}.date, ${readingHoursTable}.hour_zero AS 'hr0',${readingHoursTable}.hour_one AS 'hr1',  ${readingHoursTable}.hour_two AS 'hr2', ${readingHoursTable}.hour_three AS 'hr3', ${readingHoursTable}.hour_four AS 'hr4', ${readingHoursTable}.hour_five AS 'hr5', ${readingHoursTable}.hour_six AS 'hr6', ${readingHoursTable}.hour_seven AS 'hr7', ${readingHoursTable}.hour_eight AS 'hr8', ${readingHoursTable}.hour_nine AS 'hr9', ${readingHoursTable}.hour_ten AS 'hr10', ${readingHoursTable}.hour_eleven AS 'hr11', ${readingHoursTable}.hour_twelve AS 'hr12', ${readingHoursTable}.hour_thirteen AS 'hr13', ${readingHoursTable}.hour_fourteen AS 'hr14', ${readingHoursTable}.hour_fifteen AS 'hr15', ${readingHoursTable}.hour_sixteen AS 'hr16', ${readingHoursTable}.hour_seventeen AS 'hr17', ${readingHoursTable}.hour_eighteen AS 'hr18', ${readingHoursTable}.hour_nineteen AS 'hr19', ${readingHoursTable}.hour_twenty AS 'hr20', ${readingHoursTable}.hour_twentyone AS 'hr21', ${readingHoursTable}.hour_twentytwo AS 'hr22', ${readingHoursTable}.hour_twentythree AS 'hr23', ${predictionsHoursTable}.hour_zero AS 'phr0', ${predictionsHoursTable}.hour_one AS 'phr1',  ${predictionsHoursTable}.hour_two AS 'phr2', ${predictionsHoursTable}.hour_three AS 'phr3', ${predictionsHoursTable}.hour_four AS 'phr4', ${predictionsHoursTable}.hour_five AS 'phr5', ${predictionsHoursTable}.hour_six AS 'phr6', ${predictionsHoursTable}.hour_seven AS 'phr7', ${predictionsHoursTable}.hour_eight AS 'phr8', ${predictionsHoursTable}.hour_nine AS 'phr9', ${predictionsHoursTable}.hour_ten AS 'phr10', ${predictionsHoursTable}.hour_eleven AS 'phr11', ${predictionsHoursTable}.hour_twelve AS 'phr12', ${predictionsHoursTable}.hour_thirteen AS 'phr13', ${predictionsHoursTable}.hour_fourteen AS 'phr14', ${predictionsHoursTable}.hour_fifteen AS 'phr15', ${predictionsHoursTable}.hour_sixteen AS 'phr16', ${predictionsHoursTable}.hour_seventeen AS 'phr17', ${predictionsHoursTable}.hour_eighteen AS 'phr18', ${predictionsHoursTable}.hour_nineteen AS 'phr19', ${predictionsHoursTable}.hour_twenty AS 'phr20', ${predictionsHoursTable}.hour_twentyone AS 'phr21', ${predictionsHoursTable}.hour_twentytwo AS 'phr22', ${predictionsHoursTable}.hour_twentythree AS 'phr23', is_manufacturer FROM clients
    INNER JOIN ${readingHoursTable} on clients.id = ${readingHoursTable}.client_id 
    INNER JOIN ${predictionsHoursTable} on ${predictionsHoursTable}.client_id = clients.id
    WHERE type = 1
    AND clients.id = ${clientID} `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${predictionsHoursTable}.date>='${fromDate}' AND ${predictionsHoursTable}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${predictionsHoursTable}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${predictionsHoursTable}.date<='${toDate}' `;
    }
    sql += ` AND ${predictionsHoursTable}.date = ${readingHoursTable}.date`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/eso-hour-readings-clients/getClient/:id', (req, res) => {
    const hoursTable = 'hour_readings_eso';
    let sql = `SELECT ${hoursTable}.id,
    client_name,
    client_number,
    ident_code,
    metering_type,
    erp_type,
    profile_id,
    is_manufacturer,
    date_created,
    client_id,
    date,
    hour_zero,
    hour_one,
    hour_two,
    hour_three,
    hour_four,
    hour_five,
    hour_six,
    hour_seven,
    hour_eight,
    hour_nine,
    hour_ten,
    hour_eleven,
    hour_twelve,
    hour_thirteen,
    hour_fourteen,
    hour_fifteen,
    hour_sixteen,
    hour_seventeen,
    hour_eighteen,
    hour_nineteen,
    hour_twenty,
    hour_twentyone,
    hour_twentytwo,
    hour_twentythree,
    type,
    created_date
    FROM clients
    INNER JOIN ${hoursTable} on clients.id = ${hoursTable}.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/eso-graph-predictions-clients/getClient/:id', (req, res) => {
    const predictionTable = 'hour_prediction_eso';
    let sql = `SELECT ${predictionTable}.id,
    client_name,
    client_number,
    ident_code,
    metering_type,
    erp_type,
    profile_id,
    is_manufacturer,
    date_created,
    client_id,
    date,
    hour_zero,
    hour_one,
    hour_two,
    hour_three,
    hour_four,
    hour_five,
    hour_six,
    hour_seven,
    hour_eight,
    hour_nine,
    hour_ten,
    hour_eleven,
    hour_twelve,
    hour_thirteen,
    hour_fourteen,
    hour_fifteen,
    hour_sixteen,
    hour_seventeen,
    hour_eighteen,
    hour_nineteen,
    hour_twenty,
    hour_twentyone,
    hour_twentytwo,
    hour_twentythree,
    created_date FROM clients
    INNER JOIN ${predictionTable} on clients.id = ${predictionTable}.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/eso-imbalances-clients/getClient/:id', (req, res) => {
    const hoursTable = 'hour_readings_eso';
    const predictionTable = 'hour_prediction_eso';
    // Type = 1 Небаланс за произведена енергия 
    let sql = `SELECT clients.ident_code,${hoursTable}.date, ${hoursTable}.hour_zero AS 'hr0',${hoursTable}.hour_one AS 'hr1',  ${hoursTable}.hour_two AS 'hr2', ${hoursTable}.hour_three AS 'hr3', ${hoursTable}.hour_four AS 'hr4', ${hoursTable}.hour_five AS 'hr5', ${hoursTable}.hour_six AS 'hr6', ${hoursTable}.hour_seven AS 'hr7', ${hoursTable}.hour_eight AS 'hr8', ${hoursTable}.hour_nine AS 'hr9', ${hoursTable}.hour_ten AS 'hr10', ${hoursTable}.hour_eleven AS 'hr11', ${hoursTable}.hour_twelve AS 'hr12', ${hoursTable}.hour_thirteen AS 'hr13', ${hoursTable}.hour_fourteen AS 'hr14', ${hoursTable}.hour_fifteen AS 'hr15', ${hoursTable}.hour_sixteen AS 'hr16', ${hoursTable}.hour_seventeen AS 'hr17', ${hoursTable}.hour_eighteen AS 'hr18', ${hoursTable}.hour_nineteen AS 'hr19', ${hoursTable}.hour_twenty AS 'hr20', ${hoursTable}.hour_twentyone AS 'hr21', ${hoursTable}.hour_twentytwo AS 'hr22', ${hoursTable}.hour_twentythree AS 'hr23', ${predictionTable}.hour_zero AS 'phr0', ${predictionTable}.hour_one AS 'phr1',  ${predictionTable}.hour_two AS 'phr2', ${predictionTable}.hour_three AS 'phr3', ${predictionTable}.hour_four AS 'phr4', ${predictionTable}.hour_five AS 'phr5', ${predictionTable}.hour_six AS 'phr6', ${predictionTable}.hour_seven AS 'phr7', ${predictionTable}.hour_eight AS 'phr8', ${predictionTable}.hour_nine AS 'phr9', ${predictionTable}.hour_ten AS 'phr10', ${predictionTable}.hour_eleven AS 'phr11', ${predictionTable}.hour_twelve AS 'phr12', ${predictionTable}.hour_thirteen AS 'phr13', ${predictionTable}.hour_fourteen AS 'phr14', ${predictionTable}.hour_fifteen AS 'phr15', ${predictionTable}.hour_sixteen AS 'phr16', ${predictionTable}.hour_seventeen AS 'phr17', ${predictionTable}.hour_eighteen AS 'phr18', ${predictionTable}.hour_nineteen AS 'phr19', ${predictionTable}.hour_twenty AS 'phr20', ${predictionTable}.hour_twentyone AS 'phr21', ${predictionTable}.hour_twentytwo AS 'phr22', ${predictionTable}.hour_twentythree AS 'phr23',is_manufacturer FROM clients
    INNER JOIN ${hoursTable} on clients.id = ${hoursTable}.client_id 
    INNER JOIN ${predictionTable} on ${predictionTable}.client_id = clients.id
    WHERE type = 1
    AND clients.id = ${req.params.id}
    AND ${predictionTable}.date = ${hoursTable}.date
`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;