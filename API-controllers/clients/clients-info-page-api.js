const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.get('/api/getClientSTP/details/datalist/:operator', (req, res) => {
    let operator = req.params.operator;
    let sql = `SELECT * FROM stp_profiles WHERE type = ${operator}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});
router.post('/api/saveClientSTPChanges/details/:id', async (req, res) => {
    const profileName = req.body.profileName;
    const isManufacturer = req.body.isManufacturer;
    const isBusiness = req.body.isBusiness;
    const clientName = req.body.name;
    const clientID = req.params.id;

    const currentProfile = await getProfileIDByClientID(clientID);
    const resultProfile = await getProfileIDByName(profileName);
    let profileID = 0;
    if (resultProfile.length) {
        profileID = resultProfile[0].id;
    }
    let updateClientSQL = `UPDATE clients SET profile_id = ${profileID}, client_name = '${clientName}' WHERE id = ${clientID} `;
    let updateALLclientsSQL = `UPDATE clients SET is_manufacturer = ${isManufacturer}, is_business = ${isBusiness} WHERE client_name = '${clientName}'`;
    try {
        if (resultProfile[0].id != currentProfile[0].profile_id) {
            const selectProfileHistoryResult = selectLastProfileHistoryRowForClient(clientID);
            if (selectProfileHistoryResult) {
                updateLastRowProfileHistory(clientID);
            }
            insertRowProfileHistory(profileID, clientID)
        }
    } catch (err) {}
    queryDB(updateALLclientsSQL);
    queryDB(updateClientSQL);
    return res.sendStatus(200);
});
router.get('/api/getClientInfo/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT clients.id, stp_profiles.profile_name, client_name, ident_code, metering_type, is_manufacturer, is_business, profile_id, erp_type FROM clients
    INNER JOIN stp_profiles on clients.profile_id = stp_profiles.id
    WHERE clients.id = ${clientID}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        if (!result || result == '' || result == undefined || result == null) {
            sql = `SELECT clients.id, client_name, ident_code, metering_type, is_manufacturer, is_business, profile_id, erp_type FROM clients
            WHERE clients.id = ${clientID}`;
            db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                }
                return res.send(result[0]);
            })
        } else {
            return res.send(result[0]);
        }
    });
});
router.get('/api/hour-readings/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, hour_readings.date, hour_readings.hour_zero AS hr1,  hour_readings.hour_one AS 'hr2', hour_readings.hour_two AS 'hr3', hour_readings.hour_three AS 'hr4', hour_readings.hour_four AS 'hr5', hour_readings.hour_five AS 'hr6', hour_readings.hour_six AS 'hr7', hour_readings.hour_seven AS 'hr8', hour_readings.hour_eight AS 'hr9', hour_readings.hour_nine AS 'hr10', hour_readings.hour_ten AS 'hr11', hour_readings.hour_eleven AS 'hr12', hour_readings.hour_twelve AS 'hr13', hour_readings.hour_thirteen AS 'hr14', hour_readings.hour_fourteen AS 'hr15', hour_readings.hour_fifteen AS 'hr16', hour_readings.hour_sixteen AS 'hr17', hour_readings.hour_seventeen AS 'hr18', hour_readings.hour_eighteen AS 'hr19', hour_readings.hour_nineteen AS 'hr20', hour_readings.hour_twenty AS 'hr21', hour_readings.hour_twentyone AS 'hr22', hour_readings.hour_twentytwo AS 'hr23', hour_readings.hour_twentythree AS 'hr24'FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id
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
router.get('/api/stp-hour-readings/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, stp_hour_readings.date, stp_hour_readings.hour_zero AS 'hr1',  stp_hour_readings.hour_one AS 'hr2', stp_hour_readings.hour_two AS 'hr3', stp_hour_readings.hour_three AS 'hr4', stp_hour_readings.hour_four AS 'hr5', stp_hour_readings.hour_five AS 'hr6', stp_hour_readings.hour_six AS 'hr7', stp_hour_readings.hour_seven AS 'hr8', stp_hour_readings.hour_eight AS 'hr9', stp_hour_readings.hour_nine AS 'hr10', stp_hour_readings.hour_ten AS 'hr11', stp_hour_readings.hour_eleven AS 'hr12', stp_hour_readings.hour_twelve AS 'hr13', stp_hour_readings.hour_thirteen AS 'hr14', stp_hour_readings.hour_fourteen AS 'hr15', stp_hour_readings.hour_fifteen AS 'hr16', stp_hour_readings.hour_sixteen AS 'hr17', stp_hour_readings.hour_seventeen AS 'hr18', stp_hour_readings.hour_eighteen AS 'hr19', stp_hour_readings.hour_nineteen AS 'hr20', stp_hour_readings.hour_twenty AS 'hr21', stp_hour_readings.hour_twentyone AS 'hr22', stp_hour_readings.hour_twentytwo AS 'hr23', stp_hour_readings.hour_twentythree AS 'hr24'FROM clients
    INNER JOIN stp_hour_readings on clients.id = stp_hour_readings.client_id
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
router.get('/api/graph-predictions/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, hour_prediction.date, hour_prediction.hour_zero AS 'hr1',  hour_prediction.hour_one AS 'hr2', hour_prediction.hour_two AS 'hr3', hour_prediction.hour_three AS 'hr4', hour_prediction.hour_four AS 'hr5', hour_prediction.hour_five AS 'hr6', hour_prediction.hour_six AS 'hr7', hour_prediction.hour_seven AS 'hr8', hour_prediction.hour_eight AS 'hr9', hour_prediction.hour_nine AS 'hr10', hour_prediction.hour_ten AS 'hr11', hour_prediction.hour_eleven AS 'hr12', hour_prediction.hour_twelve AS 'hr13', hour_prediction.hour_thirteen AS 'hr14', hour_prediction.hour_fourteen AS 'hr15', hour_prediction.hour_fifteen AS 'hr16', hour_prediction.hour_sixteen AS 'hr17', hour_prediction.hour_seventeen AS 'hr18', hour_prediction.hour_eighteen AS 'hr19', hour_prediction.hour_nineteen AS 'hr20', hour_prediction.hour_twenty AS 'hr21', hour_prediction.hour_twentyone AS 'hr22', hour_prediction.hour_twentytwo AS 'hr23', hour_prediction.hour_twentythree AS 'hr24'FROM clients
    INNER JOIN hour_prediction on clients.id = hour_prediction.client_id
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
router.get('/api/stp-graph-predictions/:fromDate/:toDate/:clientID', (req, res) => {
    let {
        fromDate,
        toDate,
        clientID
    } = req.params;
    if (fromDate == -1) {
        fromDate = '';
    }
    if (toDate == -1) {
        toDate = '';
    }
    const sql = `SELECT clients.ident_code, profile_coef.date,  IF (clients.erp_type = '1',(profile_coef.hour_zero / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_zero) AS phr1
    , IF (clients.erp_type = '1', (profile_coef.hour_one / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_one) AS phr2,
    IF (clients.erp_type = '1', (profile_coef.hour_two / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_two) AS phr3,
    IF (clients.erp_type = '1', (profile_coef.hour_three / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_three) AS phr4,
    IF (clients.erp_type = '1', (profile_coef.hour_four / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_four) AS phr5,
    IF (clients.erp_type = '1', (profile_coef.hour_five / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_five) AS phr6,
    IF (clients.erp_type = '1', (profile_coef.hour_six / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_six) AS phr7,
    IF (clients.erp_type = '1', (profile_coef.hour_seven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seven) AS phr8,
    IF (clients.erp_type = '1', (profile_coef.hour_eight / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eight) AS phr9,
    IF (clients.erp_type = '1', (profile_coef.hour_nine / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nine) AS phr10,
    IF (clients.erp_type = '1', (profile_coef.hour_ten / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_ten) AS phr11,
    IF (clients.erp_type = '1', (profile_coef.hour_eleven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eleven) AS phr12,
    IF (clients.erp_type = '1', (profile_coef.hour_twelve / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twelve) AS phr13,
    IF (clients.erp_type = '1', (profile_coef.hour_thirteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_thirteen) AS phr14,
    IF (clients.erp_type = '1', (profile_coef.hour_fourteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fourteen) AS phr15,
    IF (clients.erp_type = '1', (profile_coef.hour_fifteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fifteen) AS phr16,
    IF (clients.erp_type = '1', (profile_coef.hour_sixteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_sixteen) AS phr17,
    IF (clients.erp_type = '1', (profile_coef.hour_seventeen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seventeen) AS phr18,
    IF (clients.erp_type = '1', (profile_coef.hour_eighteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eighteen) AS phr19,
    IF (clients.erp_type = '1', (profile_coef.hour_nineteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nineteen) AS phr20,
    IF (clients.erp_type = '1', (profile_coef.hour_twenty / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twenty) AS phr21,
    IF (clients.erp_type = '1', (profile_coef.hour_twentyone / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentyone) AS phr22,
    IF (clients.erp_type = '1', (profile_coef.hour_twentytwo / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentytwo) AS phr23,
    IF (clients.erp_type = '1', (profile_coef.hour_twentythree / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentythree) AS phr0,
    amount
    FROM clients
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE clients.id = '${clientID}'
    AND MONTH(prediction.date) = MONTH(profile_coef.date)
    AND YEAR(prediction.date) = YEAR(profile_coef.date)
    AND profile_coef.date BETWEEN '${fromDate}' AND '${toDate}'`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
router.get('/api/imbalances/getClient/:fromDate/:toDate/:id', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.id;
    let sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_zero AS 'hr0',hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'phr0', hour_prediction.hour_one AS 'phr1',  hour_prediction.hour_two AS 'phr2', hour_prediction.hour_three AS 'phr3', hour_prediction.hour_four AS 'phr4', hour_prediction.hour_five AS 'phr5', hour_prediction.hour_six AS 'phr6', hour_prediction.hour_seven AS 'phr7', hour_prediction.hour_eight AS 'phr8', hour_prediction.hour_nine AS 'phr9', hour_prediction.hour_ten AS 'phr10', hour_prediction.hour_eleven AS 'phr11', hour_prediction.hour_twelve AS 'phr12', hour_prediction.hour_thirteen AS 'phr13', hour_prediction.hour_fourteen AS 'phr14', hour_prediction.hour_fifteen AS 'phr15', hour_prediction.hour_sixteen AS 'phr16', hour_prediction.hour_seventeen AS 'phr17', hour_prediction.hour_eighteen AS 'phr18', hour_prediction.hour_nineteen AS 'phr19', hour_prediction.hour_twenty AS 'phr20', hour_prediction.hour_twentyone AS 'phr21', hour_prediction.hour_twentytwo AS 'phr22', hour_prediction.hour_twentythree AS 'phr23', is_manufacturer FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    INNER JOIN hour_prediction on hour_prediction.client_id = clients.id
    WHERE clients.id = ${clientID} `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND hour_prediction.date>='${fromDate}' AND hour_prediction.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND hour_prediction.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND hour_prediction.date<='${toDate}' `;
    }
    sql += ` AND hour_prediction.date = hour_readings.date`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/stp-imbalances/getClient/:fromDate/:toDate/:id', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.id;
    let sql = `SELECT clients.ident_code,profile_coef.date, amount, stp_hour_readings.hour_zero AS 'hr0',stp_hour_readings.hour_one AS 'hr1',  stp_hour_readings.hour_two AS 'hr2', stp_hour_readings.hour_three AS 'hr3', stp_hour_readings.hour_four AS 'hr4', stp_hour_readings.hour_five AS 'hr5', stp_hour_readings.hour_six AS 'hr6', stp_hour_readings.hour_seven AS 'hr7', stp_hour_readings.hour_eight AS 'hr8', stp_hour_readings.hour_nine AS 'hr9', stp_hour_readings.hour_ten AS 'hr10', stp_hour_readings.hour_eleven AS 'hr11', stp_hour_readings.hour_twelve AS 'hr12', stp_hour_readings.hour_thirteen AS 'hr13', stp_hour_readings.hour_fourteen AS 'hr14', stp_hour_readings.hour_fifteen AS 'hr15', stp_hour_readings.hour_sixteen AS 'hr16', stp_hour_readings.hour_seventeen AS 'hr17', stp_hour_readings.hour_eighteen AS 'hr18', stp_hour_readings.hour_nineteen AS 'hr19', stp_hour_readings.hour_twenty AS 'hr20', stp_hour_readings.hour_twentyone AS 'hr21', stp_hour_readings.hour_twentytwo AS 'hr22', stp_hour_readings.hour_twentythree AS 'hr23',
    IF (clients.erp_type = '1',(profile_coef.hour_zero / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_zero) AS phr0
    , IF (clients.erp_type = '1', (profile_coef.hour_one / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_one) AS phr1,
    IF (clients.erp_type = '1', (profile_coef.hour_two / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_two) AS phr2,
    IF (clients.erp_type = '1', (profile_coef.hour_three / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_three) AS phr3,
    IF (clients.erp_type = '1', (profile_coef.hour_four / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_four) AS phr4,
    IF (clients.erp_type = '1', (profile_coef.hour_five / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_five) AS phr5,
    IF (clients.erp_type = '1', (profile_coef.hour_six / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_six) AS phr6,
    IF (clients.erp_type = '1', (profile_coef.hour_seven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seven) AS phr7,
    IF (clients.erp_type = '1', (profile_coef.hour_eight / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eight) AS phr8,
    IF (clients.erp_type = '1', (profile_coef.hour_nine / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nine) AS phr9,
    IF (clients.erp_type = '1', (profile_coef.hour_ten / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_ten) AS phr10,
    IF (clients.erp_type = '1', (profile_coef.hour_eleven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eleven) AS phr11,
    IF (clients.erp_type = '1', (profile_coef.hour_twelve / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twelve) AS phr12,
    IF (clients.erp_type = '1', (profile_coef.hour_thirteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_thirteen) AS phr13,
    IF (clients.erp_type = '1', (profile_coef.hour_fourteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fourteen) AS phr14,
    IF (clients.erp_type = '1', (profile_coef.hour_fifteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fifteen) AS phr15,
    IF (clients.erp_type = '1', (profile_coef.hour_sixteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_sixteen) AS phr16,
    IF (clients.erp_type = '1', (profile_coef.hour_seventeen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seventeen) AS phr17,
    IF (clients.erp_type = '1', (profile_coef.hour_eighteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eighteen) AS phr18,
    IF (clients.erp_type = '1', (profile_coef.hour_nineteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nineteen) AS phr19,
    IF (clients.erp_type = '1', (profile_coef.hour_twenty / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twenty) AS phr20,
    IF (clients.erp_type = '1', (profile_coef.hour_twentyone / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentyone) AS phr21,
    IF (clients.erp_type = '1', (profile_coef.hour_twentytwo / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentytwo) AS phr22,
    IF (clients.erp_type = '1', (profile_coef.hour_twentythree / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentythree) AS phr23, is_manufacturer FROM clients
    INNER JOIN stp_hour_readings ON clients.id = stp_hour_readings.client_id 
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE MONTH(prediction.date) = MONTH(profile_coef.date)
    AND YEAR(prediction.date) = YEAR(profile_coef.date)
    AND profile_coef.date = stp_hour_readings.date
    AND clients.id = ${clientID} `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND profile_coef.date>='${fromDate}' AND profile_coef.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND profile_coef.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND profile_coef.date<='${toDate}' `;
    }
    sql += ` GROUP BY profile_coef.date`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/hour-readings/getClient/:id', (req, res) => {
    let sql = `SELECT hour_readings.id,
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
    energy_type,
    created_date,
    diff  FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/stp-hour-readings/getClient/:id', (req, res) => {
    let sql = `SELECT stp_hour_readings.id,
    client_name,
    client_number,
    ident_code,
    metering_type,
    clients.erp_type,
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
    diff,
    created_date FROM clients
    INNER JOIN stp_hour_readings on clients.id = stp_hour_readings.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/graph-predictions/getClient/:id', (req, res) => {
    let sql = `SELECT hour_prediction.id,
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
    erp,
    created_date FROM clients
    INNER JOIN hour_prediction on clients.id = hour_prediction.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/stp-graph-predictions/getClient/:id', (req, res) => {
    const clientID = req.params.id;
    const sql = `SELECT clients.client_name, clients.ident_code, profile_coef.date, amount,  IF (clients.erp_type = '1',(profile_coef.hour_zero / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_zero) AS phr0
    , IF (clients.erp_type = '1', (profile_coef.hour_one / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_one) AS phr1,
    IF (clients.erp_type = '1', (profile_coef.hour_two / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_two) AS phr2,
    IF (clients.erp_type = '1', (profile_coef.hour_three / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_three) AS phr3,
    IF (clients.erp_type = '1', (profile_coef.hour_four / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_four) AS phr4,
    IF (clients.erp_type = '1', (profile_coef.hour_five / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_five) AS phr5,
    IF (clients.erp_type = '1', (profile_coef.hour_six / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_six) AS phr6,
    IF (clients.erp_type = '1', (profile_coef.hour_seven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seven) AS phr7,
    IF (clients.erp_type = '1', (profile_coef.hour_eight / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eight) AS phr8,
    IF (clients.erp_type = '1', (profile_coef.hour_nine / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nine) AS phr9,
    IF (clients.erp_type = '1', (profile_coef.hour_ten / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_ten) AS phr10,
    IF (clients.erp_type = '1', (profile_coef.hour_eleven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eleven) AS phr11,
    IF (clients.erp_type = '1', (profile_coef.hour_twelve / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twelve) AS phr12,
    IF (clients.erp_type = '1', (profile_coef.hour_thirteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_thirteen) AS phr13,
    IF (clients.erp_type = '1', (profile_coef.hour_fourteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fourteen) AS phr14,
    IF (clients.erp_type = '1', (profile_coef.hour_fifteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fifteen) AS phr15,
    IF (clients.erp_type = '1', (profile_coef.hour_sixteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_sixteen) AS phr16,
    IF (clients.erp_type = '1', (profile_coef.hour_seventeen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seventeen) AS phr17,
    IF (clients.erp_type = '1', (profile_coef.hour_eighteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eighteen) AS phr18,
    IF (clients.erp_type = '1', (profile_coef.hour_nineteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nineteen) AS phr19,
    IF (clients.erp_type = '1', (profile_coef.hour_twenty / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twenty) AS phr20,
    IF (clients.erp_type = '1', (profile_coef.hour_twentyone / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentyone) AS phr21,
    IF (clients.erp_type = '1', (profile_coef.hour_twentytwo / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentytwo) AS phr22,
    IF (clients.erp_type = '1', (profile_coef.hour_twentythree / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentythree) AS phr23
    FROM clients
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE clients.id = '${clientID}'
    AND MONTH(prediction.date) = MONTH(profile_coef.date)
    AND YEAR(prediction.date) = YEAR(profile_coef.date)`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/imbalances/getClient/:id', (req, res) => {
    let sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_zero AS 'hr0',hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'phr0', hour_prediction.hour_one AS 'phr1',  hour_prediction.hour_two AS 'phr2', hour_prediction.hour_three AS 'phr3', hour_prediction.hour_four AS 'phr4', hour_prediction.hour_five AS 'phr5', hour_prediction.hour_six AS 'phr6', hour_prediction.hour_seven AS 'phr7', hour_prediction.hour_eight AS 'phr8', hour_prediction.hour_nine AS 'phr9', hour_prediction.hour_ten AS 'phr10', hour_prediction.hour_eleven AS 'phr11', hour_prediction.hour_twelve AS 'phr12', hour_prediction.hour_thirteen AS 'phr13', hour_prediction.hour_fourteen AS 'phr14', hour_prediction.hour_fifteen AS 'phr15', hour_prediction.hour_sixteen AS 'phr16', hour_prediction.hour_seventeen AS 'phr17', hour_prediction.hour_eighteen AS 'phr18', hour_prediction.hour_nineteen AS 'phr19', hour_prediction.hour_twenty AS 'phr20', hour_prediction.hour_twentyone AS 'phr21', hour_readings.hour_twentytwo AS 'phr22', hour_prediction.hour_twentythree AS 'phr23',is_manufacturer FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    INNER JOIN hour_prediction on hour_prediction.client_id = clients.id
    WHERE clients.id = ${req.params.id}
    AND hour_prediction.date = hour_readings.date
`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/stp-imbalances/getClient/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT clients.ident_code,profile_coef.date, amount, stp_hour_readings.hour_zero AS 'hr0',stp_hour_readings.hour_one AS 'hr1',  stp_hour_readings.hour_two AS 'hr2', stp_hour_readings.hour_three AS 'hr3', stp_hour_readings.hour_four AS 'hr4', stp_hour_readings.hour_five AS 'hr5', stp_hour_readings.hour_six AS 'hr6', stp_hour_readings.hour_seven AS 'hr7', stp_hour_readings.hour_eight AS 'hr8', stp_hour_readings.hour_nine AS 'hr9', stp_hour_readings.hour_ten AS 'hr10', stp_hour_readings.hour_eleven AS 'hr11', stp_hour_readings.hour_twelve AS 'hr12', stp_hour_readings.hour_fourteen AS 'hr13', stp_hour_readings.hour_fourteen AS 'hr14', stp_hour_readings.hour_fifteen AS 'hr15', stp_hour_readings.hour_sixteen AS 'hr16', stp_hour_readings.hour_seventeen AS 'hr17', stp_hour_readings.hour_eighteen AS 'hr18', stp_hour_readings.hour_nineteen AS 'hr19', stp_hour_readings.hour_twenty AS 'hr20', stp_hour_readings.hour_twentyone AS 'hr21', stp_hour_readings.hour_twentytwo AS 'hr22', stp_hour_readings.hour_twentythree AS 'hr23',
    IF (clients.erp_type = '1',(profile_coef.hour_zero / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_zero) AS phr0
    , IF (clients.erp_type = '1', (profile_coef.hour_one / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_one) AS phr1,
    IF (clients.erp_type = '1', (profile_coef.hour_two / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_two) AS phr2,
    IF (clients.erp_type = '1', (profile_coef.hour_three / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_three) AS phr3,
    IF (clients.erp_type = '1', (profile_coef.hour_four / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_four) AS phr4,
    IF (clients.erp_type = '1', (profile_coef.hour_five / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_five) AS phr5,
    IF (clients.erp_type = '1', (profile_coef.hour_six / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_six) AS phr6,
    IF (clients.erp_type = '1', (profile_coef.hour_seven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seven) AS phr7,
    IF (clients.erp_type = '1', (profile_coef.hour_eight / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eight) AS phr8,
    IF (clients.erp_type = '1', (profile_coef.hour_nine / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nine) AS phr9,
    IF (clients.erp_type = '1', (profile_coef.hour_ten / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_ten) AS phr10,
    IF (clients.erp_type = '1', (profile_coef.hour_eleven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eleven) AS phr11,
    IF (clients.erp_type = '1', (profile_coef.hour_twelve / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twelve) AS phr12,
    IF (clients.erp_type = '1', (profile_coef.hour_thirteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_thirteen) AS phr13,
    IF (clients.erp_type = '1', (profile_coef.hour_fourteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fourteen) AS phr14,
    IF (clients.erp_type = '1', (profile_coef.hour_fifteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fifteen) AS phr15,
    IF (clients.erp_type = '1', (profile_coef.hour_sixteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_sixteen) AS phr16,
    IF (clients.erp_type = '1', (profile_coef.hour_seventeen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seventeen) AS phr17,
    IF (clients.erp_type = '1', (profile_coef.hour_eighteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eighteen) AS phr18,
    IF (clients.erp_type = '1', (profile_coef.hour_nineteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nineteen) AS phr19,
    IF (clients.erp_type = '1', (profile_coef.hour_twenty / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twenty) AS phr20,
    IF (clients.erp_type = '1', (profile_coef.hour_twentyone / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentyone) AS phr21,
    IF (clients.erp_type = '1', (profile_coef.hour_twentytwo / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentytwo) AS phr22,
    IF (clients.erp_type = '1', (profile_coef.hour_twentythree / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where clients.id = '${clientID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentythree) AS phr23, is_manufacturer FROM clients
   INNER JOIN stp_hour_readings ON clients.id = stp_hour_readings.client_id 
   INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
   INNER JOIN prediction ON prediction.client_id = clients.id
   WHERE MONTH(prediction.date) = MONTH(profile_coef.date)
   AND YEAR(prediction.date) = YEAR(profile_coef.date)
   AND profile_coef.date = stp_hour_readings.date
   AND clients.id = ${clientID} 
`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/getClientSTP/details/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT DISTINCT client_name, ident_code, profile_id, is_manufacturer ,operator FROM clients 
    INNER JOIN invoicing on invoicing.client_id = clients.id
    WHERE clients.metering_type = 2 AND clients.id = ${clientID}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result[0]);
    });
});

router.get('/api/profile-history/:clientID', (req, res) => {
    const {
        clientID
    } = req.params;
    const sql = `SELECT DISTINCT profile_history.created_date, profile_history.end_date, profile_history.profile_id, stp_profiles.profile_name
    FROM profile_history
    INNER JOIN clients ON clients.profile_id = profile_history.id
    INNER JOIN stp_profiles ON stp_profiles.id = profile_history.profile_id
    WHERE profile_history.client_id = '${clientID}'
    ORDER BY created_date DESC`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});

async function getProfileIDByClientID(clientID) {
    const currentProfileSQL = `SELECT clients.profile_id FROM clients WHERE clients.id = '${clientID}'`;
    return await dbSync.query(currentProfileSQL);
}

async function getProfileIDByName(profileName) {
    const selectProfileSQL = `SELECT id FROM stp_profiles
    WHERE profile_name = '${profileName}'
    LIMIT 1`;
    return await dbSync.query(selectProfileSQL);
}

async function selectLastProfileHistoryRowForClient(clientID) {
    const selectProfileHistoryRowSQL = `SELECT id FROM profile_history WHERE client_id = '${clientID}'`;
    return await dbSync.query(selectProfileHistoryRowSQL);
}

function updateLastRowProfileHistory(clientID) {
    const updateProfileHistoryRowSQL = `UPDATE profile_history SET end_date = now() WHERE client_id = '${clientID}' ORDER BY created_date DESC LIMIT 1`;
    db.query(updateProfileHistoryRowSQL, (err, result) => {
        if (err) {
            throw err;
        }
    });
}

function insertRowProfileHistory(profileID, clientID) {
    const insertProfileHistoryRowSQL = `INSERT INTO profile_history (profile_id, client_id, created_date)
    VALUES (${profileID}, ${clientID}, now());`;
    db.query(insertProfileHistoryRowSQL, (err, result) => {
        if (err) {
            throw err;
        }
    });
}

function queryDB(sql) {
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return result;
    });
}

module.exports = router;