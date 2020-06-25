const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/createProfile', (req, res) => {
    let name = req.body.name;
    let type = req.body.type;
    let sql = `INSERT IGNORE INTO stp_profiles (profile_name, type) VALUES ('${name}', '${type}')`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Данните се обработват');
        return res.send("Данните се обработват");
    });
});

router.post('/api/getProfileID', (req, res) => {
    let name = req.body.name;
    let sql = `SELECT id FROM stp_profiles WHERE profile_name = '${name}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Взето е ид-то на профила');
        return res.send(JSON.stringify(result[0].id));
    });
});

router.get('/api/getProfile/:ident_code', (req, res) => {
    let identCode = req.params.ident_code;
    let sql = `SELECT profile_id FROM clients WHERE ident_code = '${identCode}'`;
    let result = dbSync.query(sql);
    return result;
});

router.post('/api/profileIDs', (req, res) => {
    const {
        identCodes
    } = req.body;
    const sql = `SELECT ident_code
    FROM clients
    WHERE ident_code IN (?)
    AND profile_id = 0`;
    db.query(sql, [identCodes], function (err, result) {
        if (err) throw err;
        if (result && result.length) {
            let identCodeArr = [];
            for (let res of result) {
                identCodeArr.push(res.ident_code);
            }
            return res.send(JSON.stringify(identCodeArr));
        }
    });
})

router.get('/api/getProfile-HourValue/:identCode/:date', (req, res) => {
    let {
        identCode,
        date
    } = req.params;

    let sqlDate = new Date(date);

    // First and last day of month
    let fromDate = new Date(sqlDate.getFullYear(), sqlDate.getMonth(), 1);
    let toDate = new Date(sqlDate.getFullYear(), sqlDate.getMonth() + 1, 0);
    let formattedFromDate = `${fromDate.getFullYear()}-${fromDate.getMonth()+1<10?`0${fromDate.getMonth()}`:fromDate.getMonth()+1}-${fromDate.getDate()<10?`0${fromDate.getDate()}`:fromDate.getDate()}`;
    let formattedToDate = `${toDate.getFullYear()}-${toDate.getMonth()+1<10?`0${toDate.getMonth()}`:toDate.getMonth()+1}-${toDate.getDate()<10?`0${toDate.getDate()}`:toDate.getDate()}`;
    let sql = `SELECT profile_coef.date,  
    IFNULL (0, hour_zero) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_zero,
    IFNULL (0, hour_one) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_one,
    IFNULL (0, hour_two) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_two,
    IFNULL (0, hour_three) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_three,
    IFNULL (0, hour_four) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_four,
    IFNULL (0, hour_five) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_five,
    IFNULL (0, hour_six) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_six,
    IFNULL (0, hour_seven) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_seven,
    IFNULL (0, hour_eight) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_eight,
    IFNULL (0, hour_nine) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_nine,
    IFNULL (0, hour_ten) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_ten,
    IFNULL (0, hour_eleven) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_eleven,
    IFNULL (0, hour_twelve) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_twelve,
    IFNULL (0, hour_thirteen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_thirteen,
    IFNULL (0, hour_fourteen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_fourteen,
    IFNULL (0, hour_fifteen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_fifteen,
    IFNULL (0, hour_sixteen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_sixteen,
    IFNULL (0, hour_seventeen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_seventeen,
    IFNULL (0, hour_eighteen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_eighteen,
    IFNULL (0, hour_nineteen) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_nineteen,
    IFNULL (0, hour_twenty) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_twenty,
    IFNULL (0, hour_twentyone) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_twentyone,
    IFNULL (0, hour_twentytwo) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_twentytwo,
    IFNULL (0, hour_twentythree) / (SELECT (sum(hour_one) + sum(hour_two) + sum(hour_three) + sum(hour_four) + sum(hour_five) + sum(hour_six) + sum(hour_seven) + sum(hour_eight) + sum(hour_nine) + sum(hour_ten) + sum(hour_eleven) + sum(hour_twelve) + sum(hour_thirteen) + sum(hour_fourteen) + sum(hour_fifteen) + sum(hour_sixteen) + sum(hour_seventeen) + sum(hour_eighteen) + sum(hour_nineteen) + sum(hour_twenty) + sum(hour_twentyone) + sum(hour_twentytwo) + sum(hour_twentythree) + sum(hour_zero)) FROM profile_coef INNER JOIN clients ON profile_coef.profile_id = clients.profile_id WHERE MONTH(prediction.date) = MONTH(profile_coef.date) AND YEAR(prediction.date) = YEAR(profile_coef.date) AND clients.ident_code = '${identCode}') as hour_twentythree
    FROM prediction 
    INNER JOIN clients ON prediction.client_id = clients.id
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    WHERE profile_coef.date between '${formattedFromDate}' AND '${formattedToDate}' 
    AND clients.ident_code = '${identCode}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.post('/api/saveProfileReadings', async (req, res) => {
    let profileReadingsFiltered = await filterProfileHourReadings(req.body);
    let sql = `INSERT INTO profile_coef (profile_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, created_date) VALUES ?
    ON DUPLICATE KEY UPDATE
    hour_zero = VALUES(hour_zero),
       hour_one= VALUES(hour_one),
       hour_two = VALUES(hour_two),
       hour_three = VALUES(hour_three),
       hour_four = VALUES(hour_four),
       hour_five = VALUES(hour_five),
       hour_six = VALUES(hour_six),
       hour_seven = VALUES(hour_seven),
       hour_eight = VALUES(hour_eight),
       hour_nine = VALUES(hour_nine),
       hour_ten = VALUES(hour_ten),
       hour_eleven = VALUES(hour_eleven),
       hour_twelve = VALUES(hour_twelve),
       hour_thirteen = VALUES(hour_thirteen),
       hour_fourteen = VALUES(hour_fourteen),
       hour_fifteen = VALUES(hour_fifteen),
       hour_sixteen = VALUES(hour_sixteen),
       hour_seventeen = VALUES(hour_seventeen),
       hour_eighteen = VALUES(hour_eighteen),
       hour_nineteen = VALUES(hour_nineteen),
       hour_twenty = VALUES(hour_twenty),
       hour_twentyone = VALUES(hour_twentyone),
       hour_twentytwo = VALUES(hour_twentytwo),
       hour_twentythree = VALUES(hour_twentythree),
       created_date = VALUES(created_date)`;
    db.query(sql, [profileReadingsFiltered], (err, result) => {
        if (err) {
            return res.send(`Вече има профил с това име / Данните вече съществуват`);
        } else {
            console.log('Данните за профили са вкарани в базата');
            return res.send("Данните за профили са вкарани в базата");
        }
    });
});

async function filterProfileHourReadings(allProfileHourReadings) {
    let readingsFiltered = [];
    let addToFinalReadings;
    // allProfileHourReadings.length
    for (let i = 0; i < allProfileHourReadings.length; i += 1) {
        addToFinalReadings = true;

        let currHourReading = allProfileHourReadings[i];
        let hour_one = null;
        let hour_two = null;
        let hour_three = null;
        let hour_four = null;
        let hour_five = null;
        let hour_six = null;
        let hour_seven = null;
        let hour_eight = null;
        let hour_nine = null;
        let hour_ten = null;
        let hour_eleven = null;
        let hour_twelve = null;
        let hour_thirteen = null;
        let hour_fourteen = null;
        let hour_fifteen = null;
        let hour_sixteen = null;
        let hour_seventeen = null;
        let hour_eighteen = null;
        let hour_nineteen = null;
        let hour_twenty = null;
        let hour_twentyone = null;
        let hour_twentytwo = null;
        let hour_twentythree = null;
        let hour_zero = null;
        let filteredHourReading = [];
        let currID = currHourReading[0];
        let date = currHourReading[1].split('-');
        let currDate = currHourReading[1];
        if (currDate.includes('undefined')) {
            currDate = `${date[0].split('.')[2]}-${date[0].split('.')[1]}-${date[0].split('.')[0]}`
        }
        let createdDate = currHourReading[3];
        for (let z = 0; z < currHourReading[2].length; z += 1) {
            switch (currHourReading[2][z].currHour) {
                case '1:00':
                case '01:00':
                case 1:
                    hour_one = currHourReading[2][z].currValue;
                    break;
                case '2:00':
                case '02:00':
                case 2:
                    hour_two = currHourReading[2][z].currValue;
                    break;
                case '3:00':
                case '03:00':
                case 3:
                    hour_three = currHourReading[2][z].currValue;
                    break;
                case '4:00':
                case '04:00':
                case 4:
                    hour_four = currHourReading[2][z].currValue;
                    break;
                case '5:00':
                case '05:00':
                case 5:
                    hour_five = currHourReading[2][z].currValue;
                    break;
                case '6:00':
                case '06:00':
                case 6:
                    hour_six = currHourReading[2][z].currValue;
                    break;
                case '7:00':
                case '07:00':
                case 7:
                    hour_seven = currHourReading[2][z].currValue;
                    break;
                case '8:00':
                case '08:00':
                case 8:
                    hour_eight = currHourReading[2][z].currValue;
                    break;
                case '9:00':
                case '09:00':
                case 9:
                    hour_nine = currHourReading[2][z].currValue;
                    break;
                case '10:00':
                case 10:
                    hour_ten = currHourReading[2][z].currValue;
                    break;
                case '11:00':
                case 11:
                    hour_eleven = currHourReading[2][z].currValue;
                    break;
                case '12:00':
                case 12:
                    hour_twelve = currHourReading[2][z].currValue;
                    break;
                case '13:00':
                case 13:
                    hour_thirteen = currHourReading[2][z].currValue;
                    break;
                case '14:00':
                case 14:
                    hour_fourteen = currHourReading[2][z].currValue;
                    break;
                case '15:00':
                case 15:
                    hour_fifteen = currHourReading[2][z].currValue;
                    break;
                case '16:00':
                case 16:
                    hour_sixteen = currHourReading[2][z].currValue;
                    break;
                case '17:00':
                case 17:
                    hour_seventeen = currHourReading[2][z].currValue;
                    break;
                case '18:00':
                case 18:
                    hour_eighteen = currHourReading[2][z].currValue;
                    break;
                case '19:00':
                case 19:
                    hour_nineteen = currHourReading[2][z].currValue;
                    break;
                case '20:00':
                case 20:
                    hour_twenty = currHourReading[2][z].currValue;
                    break;
                case '21:00':
                case 21:
                    hour_twentyone = currHourReading[2][z].currValue;
                    break;
                case '22:00':
                case 22:
                    hour_twentytwo = currHourReading[2][z].currValue;
                    break;
                case '23:00':
                case 23:
                    hour_twentythree = currHourReading[2][z].currValue;
                    break;
                case '0:00':
                case '00:00':
                case 0:
                    hour_zero = currHourReading[2][z].currValue;
                    break;
            }
        }
        /*  let selectReading = `SELECT * FROM profile_coef 
         WHERE profile_coef.date = '${currDate}'
         AND profile_id = '${currID}'`;
         let result = dbSync.query(selectReading);
         if (result.length != 0 && result[0] != undefined && result[0].length != 0) {
             if (result[0].hour_one != -1 && result[0].hour_two != -1 && result[0].hour_three != -1 && result[0].hour_four != -1 && result[0].hour_five != -1 && result[0].hour_six != -1 && result[0].hour_seven != -1 && result[0].hour_eight != -1 && result[0].hour_nine != -1 && result[0].hour_ten != -1 && result[0].hour_eleven != -1 && result[0].hour_twelve != -1 && result[0].hour_thirteen != -1 && result[0].hour_fourteen != -1 && result[0].hour_fifteen != -1 && result[0].hour_sixteen != -1 && result[0].hour_seventeen != -1 && result[0].hour_eighteen != -1 && result[0].hour_nineteen != -1 && result[0].hour_twenty != -1 && result[0].hour_twentyone != -1 && result[0].hour_twentytwo != -1 && result[0].hour_twentythree != -1 && result[0].hour_zero != -1) {
                 // Check if result values are different from current hour values
                 if (result[0].hour_one != hour_one || result[0].hour_two != hour_two || result[0].hour_three != hour_three || result[0].hour_four != hour_four || result[0].hour_five != hour_five || result[0].hour_six != hour_six || result[0].hour_seven != hour_seven || result[0].hour_eight != hour_eight || result[0].hour_nine != hour_nine || result[0].hour_ten != hour_ten || result[0].hour_eleven != hour_eleven || result[0].hour_twelve != hour_twelve || result[0].hour_thirteen != hour_thirteen || result[0].hour_fourteen != hour_fourteen || result[0].hour_fifteen != hour_fifteen || result[0].hour_sixteen != hour_sixteen || result[0].hour_seventeen != hour_seventeen || result[0].hour_eighteen != hour_eighteen || result[0].hour_nineteen != hour_nineteen || result[0].hour_twenty != hour_twenty || result[0].hour_twentyone != hour_twentyone || result[0].hour_twentytwo != hour_twentytwo || result[0].hour_twentythree != hour_twentythree || result[0].hour_zero != hour_zero) {
                     // Result has everything
                     // Current reading values are different than result value
                     // Insert updateValue as new row
                     hasEverything = true;
                     addToFinalReadings = true;
                     diff = 1;
                 } else {
                     addToFinalReadings = false;
                 }
             }
             // Update when result is not full
             else {
                 addToFinalReadings = false;
                 let isChanged = false;
                 let isFirst = true;
                 let updateQuery = `UPDATE profile_coef SET`;
                 if (result[0].hour_one == -1 && result[0].hour_one != hour_one) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_one = '${hour_one}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_two == -1 && result[0].hour_two != hour_two) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_two = '${hour_two}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_three == -1 != result[0].hour_three != hour_three) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_three = '${hour_three}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_four == -1 && result[0].hour_four != hour_four) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_four = '${hour_four}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_five == -1 && result[0].hour_five != hour_five) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_five = '${hour_five}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_six == -1 && result[0].hour_six != hour_six) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_six = '${hour_six}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_seven == -1 && result[0].hour_seven != hour_seven) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_seven = '${hour_seven}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_eight == -1 && result[0].hour_eight != hour_eight) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_eight = '${hour_eight}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_nine == -1 && result[0].hour_nine != hour_nine) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_nine = '${hour_nine}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_ten == -1 && result[0].hour_ten != hour_ten) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_ten = '${hour_ten}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_eleven == -1 && result[0].hour_eleven != hour_eleven) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_eleven = '${hour_eleven}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_twelve == -1 && result[0].hour_twelve != hour_twelve) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_twelve = '${hour_twelve}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_thirteen == -1 && result[0].hour_thirteen != hour_thirteen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_thirteen = '${hour_thirteen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_fourteen == -1 && result[0].hour_fourteen != hour_fourteen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_fourteen = '${hour_fourteen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_fifteen == -1 && result[0].hour_fifteen != hour_fifteen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_fifteen = '${hour_fifteen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_sixteen == -1 && result[0].hour_sixteen != hour_sixteen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_sixteen = '${hour_sixteen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_seventeen == -1 && result[0].hour_seventeen != hour_seventeen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_seventeen = '${hour_seventeen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_eighteen == -1 && result[0].hour_eighteen != hour_eighteen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_eighteen = '${hour_eighteen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_nineteen == -1 && result[0].hour_nineteen != hour_nineteen) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_nineteen = '${hour_nineteen}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_twenty == -1 && result[0].hour_twenty != hour_twenty) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_twenty = '${hour_twenty}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_twentyone == -1 && result[0].hour_twentyone != hour_twentyone) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_twentyone = '${hour_twentyone}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_twentytwo == -1 && result[0].hour_twentytwo != hour_twentytwo) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_twentytwo = '${hour_twentytwo}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_twentythree == -1 && result[0].hour_twentythree != hour_twentythree) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += ` hour_twentythree = '${hour_twentythree}' `;
                     isChanged = true;
                 }
                 if (result[0].hour_zero == -1 && result[0].hour_zero != hour_zero) {
                     updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                     isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                     updateQuery += `hour_zero = '${hour_zero}' `;
                     isChanged = true;
                 }
                 updateQuery += `WHERE date = '${currDate}' AND profile_id = ${currID};`;
                 if (isChanged) {
                     dbSync.query(updateQuery);
                     addToFinalReadings = false;
                 }
             }
         } else {
             // Insert row for first time
             addToFinalReadings = true;
         } */
        addToFinalReadings = true;
        if (addToFinalReadings) {
            filteredHourReading = [currID, currDate, hour_one, hour_two, hour_three, hour_four,
                hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven,
                hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen,
                hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
                hour_twentytwo, hour_twentythree, hour_zero, createdDate
            ];
            readingsFiltered.push(filteredHourReading);
        }
    }
    return readingsFiltered;
}

function checkIfFirstAndAddToInsertQuery(isFirst, updateQuery) {
    if (isFirst) {
        isFirst = false;
    } else if (!isFirst) {
        updateQuery += ' , ';
    }
    return [isFirst, updateQuery];
}

module.exports = router;