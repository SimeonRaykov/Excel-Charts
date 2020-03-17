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
        console.log('Profile inserted');
        return res.send("Profile added");
    });
});

router.post('/api/getProfileID', (req, res) => {
    let name = req.body.name;
    let sql = `SELECT id FROM stp_profiles WHERE profile_name = '${name}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Got ProfileID');
        return res.send(JSON.stringify(result[0].id));
    });
});

router.get('/api/getProfile/:ident_code', (req, res) => {
    let identCode = req.params.ident_code;
    let sql = `SELECT profile_id FROM clients WHERE ident_code = ${identCode}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result[0].profile_id));
    });
});

router.get('/api/getProfile-HourValue/:identCode/:date/', (req, res) => {
    let {identCode, date} = req.params;

    let sql = `SELECT hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven
    hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen,
    hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty,
    hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero FROM clients
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    WHERE ident_code = '${identCode}' AND date = '${date}'
    LIMIT 1`;
    let resultArr = [];
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        for(let h in result[0]){
            resultArr.push(result[0][h])
        }
        return res.send(JSON.stringify(resultArr));
    });
});

router.post('/api/saveProfileReadings', async (req, res) => {
    let profileReadingsFiltered = await filterProfileHourReadings(req.body);
    let sql = 'INSERT INTO profile_coef (profile_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, created_date) VALUES ?';
    db.query(sql, [profileReadingsFiltered], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Profile data inserted into db');
        return res.send("Profile data inserted into db");
    });
});

async function filterProfileHourReadings(allProfileHourReadings) {
    let readingsFiltered = [];
    let addToFinalReadings;
    // allProfileHourReadings.length
    for (let i = 0; i < allProfileHourReadings.length; i += 1) {
        addToFinalReadings = true;

        let currHourReading = allProfileHourReadings[i];
        let hour_one = -1;
        let hour_two = -1;
        let hour_three = -1;
        let hour_four = -1;
        let hour_five = -1;
        let hour_six = -1;
        let hour_seven = -1;
        let hour_eight = -1;
        let hour_nine = -1;
        let hour_ten = -1;
        let hour_eleven = -1;
        let hour_twelve = -1;
        let hour_thirteen = -1;
        let hour_fourteen = -1;
        let hour_fifteen = -1;
        let hour_sixteen = -1;
        let hour_seventeen = -1;
        let hour_eighteen = -1;
        let hour_nineteen = -1;
        let hour_twenty = -1;
        let hour_twentyone = -1;
        let hour_twentytwo = -1;
        let hour_twentythree = -1;
        let hour_zero = -1;
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
        let selectReading = `SELECT * FROM profile_coef 
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
        }
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

module.exports = router;