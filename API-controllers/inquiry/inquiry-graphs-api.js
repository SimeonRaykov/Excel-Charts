const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/filter/inquiry-graphs/', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        profile_name,
        metering_type
    } = req.body;
    let sql;
    let profileID;
    if (profile_name) {
        let profileNameSQL = ` SELECT id
         FROM stp_profiles
     WHERE profile_name = '${profile_name}'
     LIMIT 1 `;
        let profileRes = dbSync.query(profileNameSQL);
        profileID = profileRes[0].id;
    }

    if (metering_type === 'hour_prediction') {
        sql = `SELECT clients.ident_code,${metering_type}.date, ${metering_type}.hour_zero AS 'hr0',${metering_type}.hour_one AS 'hr1',  ${metering_type}.hour_two AS 'hr2', ${metering_type}.hour_three AS 'hr3', ${metering_type}.hour_four AS 'hr4', ${metering_type}.hour_five AS 'hr5', ${metering_type}.hour_six AS 'hr6', ${metering_type}.hour_seven AS 'hr7', ${metering_type}.hour_eight AS 'hr8', ${metering_type}.hour_nine AS 'hr9', ${metering_type}.hour_ten AS 'hr10', ${metering_type}.hour_eleven AS 'hr11', ${metering_type}.hour_twelve AS 'hr12', ${metering_type}.hour_thirteen AS 'hr13', ${metering_type}.hour_fourteen AS 'hr14', ${metering_type}.hour_fifteen AS 'hr15', ${metering_type}.hour_sixteen AS 'hr16', ${metering_type}.hour_seventeen AS 'hr17', ${metering_type}.hour_eighteen AS 'hr18', ${metering_type}.hour_nineteen AS 'hr19', ${metering_type}.hour_twenty AS 'hr20', ${metering_type}.hour_twentyone AS 'hr21', ${metering_type}.hour_twentytwo AS 'hr22', ${metering_type}.hour_twentythree AS 'hr23' FROM clients
    INNER JOIN ${metering_type} on clients.id = ${metering_type}.client_id 
    WHERE 1=1 `;
        if (fromDate != -1 && toDate != -1) {
            sql += ` AND ${metering_type}.date>='${fromDate}' AND ${metering_type}.date<= '${toDate}' `;
        } else if (fromDate != -1 && toDate == -1) {
            sql += ` AND ${metering_type}.date>='${fromDate}' `;
        } else if (toDate != -1 && fromDate == -1) {
            sql += ` AND ${metering_type}.date<='${toDate}' `;
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

        if (profileID != -1 && metering_type == 'stp_hour_readings') {
            sql += ` AND profile_id = ${profileID}`
        }
    } else if (metering_type === 'profile_coef') {
        sql = `SELECT clients.ident_code,profile_coef.date,   IF (clients.erp_type = '1',(profile_coef.hour_zero / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_zero) * amount AS hr0,
        IF (clients.erp_type = '1', (profile_coef.hour_one / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_one) * amount AS hr1,
        IF (clients.erp_type = '1', (profile_coef.hour_two / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_two) * amount AS hr2,
        IF (clients.erp_type = '1', (profile_coef.hour_three / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_three) * amount AS hr3,
        IF (clients.erp_type = '1', (profile_coef.hour_four / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_four) * amount AS hr4,
        IF (clients.erp_type = '1', (profile_coef.hour_five / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_five) * amount AS hr5,
        IF (clients.erp_type = '1', (profile_coef.hour_six / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_six) * amount AS hr6,
        IF (clients.erp_type = '1', (profile_coef.hour_seven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seven) * amount AS hr7,
        IF (clients.erp_type = '1', (profile_coef.hour_eight / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eight) * amount AS hr8,
        IF (clients.erp_type = '1', (profile_coef.hour_nine / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nine) * amount AS hr9,
        IF (clients.erp_type = '1', (profile_coef.hour_ten / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_ten) * amount AS hr10,
        IF (clients.erp_type = '1', (profile_coef.hour_eleven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eleven) * amount AS hr11,
        IF (clients.erp_type = '1', (profile_coef.hour_twelve / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twelve) * amount AS hr12,
        IF (clients.erp_type = '1', (profile_coef.hour_thirteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_thirteen) * amount AS hr13,
        IF (clients.erp_type = '1', (profile_coef.hour_fourteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id  WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fourteen) * amount AS hr14,
        IF (clients.erp_type = '1', (profile_coef.hour_fifteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fifteen) * amount AS hr15,
        IF (clients.erp_type = '1', (profile_coef.hour_sixteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_sixteen) * amount AS hr16,
        IF (clients.erp_type = '1', (profile_coef.hour_seventeen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE  clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seventeen) * amount AS hr17,
        IF (clients.erp_type = '1', (profile_coef.hour_eighteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eighteen) * amount AS hr18,
        IF (clients.erp_type = '1', (profile_coef.hour_nineteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nineteen) * amount AS hr19,
        IF (clients.erp_type = '1', (profile_coef.hour_twenty / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twenty) * amount AS hr20,
        IF (clients.erp_type = '1', (profile_coef.hour_twentyone / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentyone) * amount AS hr21,
        IF (clients.erp_type = '1', (profile_coef.hour_twentytwo / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentytwo) * amount AS hr22,
        IF (clients.erp_type = '1', (profile_coef.hour_twentythree / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id WHERE clients.id = prediction.client_id AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentythree) * amount AS hr23 FROM clients
        INNER JOIN prediction ON prediction.client_id = clients.id
        INNER JOIN stp_profiles ON stp_profiles.id = clients.profile_id
        INNER JOIN profile_coef ON profile_coef.profile_id = stp_profiles.id
            WHERE MONTH(prediction.date) = MONTH(profile_coef.date)
            AND YEAR(prediction.date) = YEAR(profile_coef.date) `;
        if (fromDate != -1 && toDate != -1) {
            sql += ` AND ${metering_type}.date>='${fromDate}' AND ${metering_type}.date<= '${toDate}' `;
        } else if (fromDate != -1 && toDate == -1) {
            sql += ` AND ${metering_type}.date>='${fromDate}' `;
        } else if (toDate != -1 && fromDate == -1) {
            sql += ` AND ${metering_type}.date<='${toDate}' `;
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
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;