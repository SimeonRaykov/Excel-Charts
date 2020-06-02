const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js'); 

router.get('/api/graphs/hour-prediction/daily/:id/:date', (req, res) => {
    let sql = `SELECT hour_prediction.id,
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
    created_date,
    client_name,
    client_number,
    ident_code,
    metering_type,
    erp_type,
    profile_id,
    is_manufacturer,
    date_created, hour_prediction.id AS hrID FROM hour_prediction
    INNER JOIN clients on hour_prediction.client_id = clients.id
    WHERE hour_prediction.date = '${req.params.date}' AND hour_prediction.id = '${req.params.id}'
    ORDER BY hour_prediction.id
    LIMIT 1`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/graphs/stp-hour-prediction/monthly/:id/:date', (req, res) => {
    const predictionID = req.params.id
    const sql = `SELECT ident_code, profile_coef.date,IF (clients.erp_type = '1',(profile_coef.hour_zero / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_zero) AS hour_zero
    , IF (clients.erp_type = '1', (profile_coef.hour_one / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_one) AS hour_one,
    IF (clients.erp_type = '1', (profile_coef.hour_two / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_two) AS hour_two,
    IF (clients.erp_type = '1', (profile_coef.hour_three / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_three) AS hour_three,
    IF (clients.erp_type = '1', (profile_coef.hour_four / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_four) AS hour_four,
    IF (clients.erp_type = '1', (profile_coef.hour_five / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_five) AS hour_five,
    IF (clients.erp_type = '1', (profile_coef.hour_six / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_six) AS hour_six,
    IF (clients.erp_type = '1', (profile_coef.hour_seven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seven) AS hour_seven,
    IF (clients.erp_type = '1', (profile_coef.hour_eight / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eight) AS hour_eight,
    IF (clients.erp_type = '1', (profile_coef.hour_nine / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nine) AS hour_nine,
    IF (clients.erp_type = '1', (profile_coef.hour_ten / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_ten) AS hour_ten,
    IF (clients.erp_type = '1', (profile_coef.hour_eleven / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eleven) AS hour_eleven,
    IF (clients.erp_type = '1', (profile_coef.hour_twelve / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twelve) AS hour_twelve,
    IF (clients.erp_type = '1', (profile_coef.hour_thirteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_thirteen) AS hour_thirteen,
    IF (clients.erp_type = '1', (profile_coef.hour_fourteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fourteen) AS hour_fourteen,
    IF (clients.erp_type = '1', (profile_coef.hour_fifteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_fifteen) AS hour_fifteen,
    IF (clients.erp_type = '1', (profile_coef.hour_sixteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )), profile_coef.hour_sixteen) AS hour_sixteen,
    IF (clients.erp_type = '1', (profile_coef.hour_seventeen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_seventeen) AS hour_seventeen,
    IF (clients.erp_type = '1', (profile_coef.hour_eighteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_eighteen) AS hour_eighteen,
    IF (clients.erp_type = '1', (profile_coef.hour_nineteen / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_nineteen) AS hour_nineteen,
    IF (clients.erp_type = '1', (profile_coef.hour_twenty / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twenty) AS hour_twenty,
    IF (clients.erp_type = '1', (profile_coef.hour_twentyone / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentyone) AS hour_twentyone,
    IF (clients.erp_type = '1', (profile_coef.hour_twentytwo / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentytwo) AS hour_twentytwo,
    IF (clients.erp_type = '1', (profile_coef.hour_twentythree / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON clients.profile_id = profile_coef.profile_id where prediction.id = '${predictionID}' AND MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) )),profile_coef.hour_twentythree) AS hour_twentythree, amount FROM prediction
    INNER JOIN clients ON prediction.client_id = clients.id
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    WHERE MONTH(profile_coef.date) = MONTH('${req.params.date}')
    AND YEAR(profile_coef.date) = YEAR('${req.params.date}')
    AND prediction.id = '${predictionID}'`;

   db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;