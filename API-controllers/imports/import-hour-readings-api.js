;
const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/addclients', (req, res) => {
    let sql = 'INSERT IGNORE INTO clients (client_number, client_name, ident_code, metering_type, profile_id, erp_type, is_manufacturer ,date_created) VALUES ?';
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Clients inserted');
        return res.send("Clients added");
    });
});

router.post('/api/getClients', (req, res) => {
    let sql = `SELECT * FROM clients WHERE ident_code IN (${req.body.join(', ')})`;
    db.query(sql, req.body.join(), (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Clients get');
        return res.send(JSON.stringify(result));
    });
});

router.post('/api/addHourReadings', async (req, res) => {
    let readingsFiltered = await filterHourReadings(req.body);
    if (readingsFiltered != []) {
        let sql = 'INSERT INTO hour_readings (client_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, energy_type, created_date, diff) VALUES ?';
        db.query(sql, [readingsFiltered], (err, result) => {
            if (err) {
                throw err;
            }
            console.log('Hour Readings inserted');
            return res.send("Hour Readings added");
        });
    } else {
        return res.send('Result list exists / Error')
    }
});

function checkIfFirstAndAddToInsertQuery(isFirst, updateQuery) {
    if (isFirst) {
        isFirst = false;
    } else if (!isFirst) {
        updateQuery += ' , ';
    }
    return [isFirst, updateQuery];
}

async function filterHourReadings(hour_readingsAll) {
    let readingsFiltered = [];
    let addToFinalReadings;
    for (let i = 0; i < hour_readingsAll.length; i += 1) {
        addToFinalReadings = true;
        let currHourReading = hour_readingsAll[i];
        let diff = 0;
        let hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight,
            hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen,
            hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
            hour_twentytwo, hour_twentythree, hour_zero;
        hour_one = hour_two = hour_three = hour_four = hour_five = hour_six = hour_seven = hour_eight = hour_nine = hour_ten = hour_eleven = hour_twelve = hour_thirteen = hour_fourteen = hour_fifteen = hour_sixteen = hour_seventeen = hour_eighteen = hour_nineteen = hour_twenty = hour_twentyone = hour_twentytwo = hour_twentythree = hour_zero = -1;
        let filteredHourReading = [];
        let currID = currHourReading[1];
        let type = currHourReading[2];
        let date = new Date(currHourReading[3]);
        let currDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        if (currDate.includes('undefined')) {
            currDate = `${date[0].split('.')[2]}-${date[0].split('.')[1]}-${date[0].split('.')[0]}`
        }
        let createdDate = currHourReading[5];
        for (let z = 0; z < currHourReading[4].length; z += 1) {
            if (currHourReading[4][z].currHour === '1:00' || currHourReading[4][z].currHour === '01:00' || currHourReading[4][z].currHour == 1) {
                hour_one = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '2:00' || currHourReading[4][z].currHour === '02:00' || currHourReading[4][z].currHour == '2') {
                hour_two = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '3:00' || currHourReading[4][z].currHour === '03:00' || currHourReading[4][z].currHour == '3') {
                hour_three = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '4:00' || currHourReading[4][z].currHour === '04:00' || currHourReading[4][z].currHour == '4') {
                hour_four = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '5:00' || currHourReading[4][z].currHour === '05:00' || currHourReading[4][z].currHour == '5') {
                hour_five = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '6:00' || currHourReading[4][z].currHour === '06:00' || currHourReading[4][z].currHour == '6') {
                hour_six = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '7:00' || currHourReading[4][z].currHour === '07:00' || currHourReading[4][z].currHour == '7') {
                hour_seven = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '8:00' || currHourReading[4][z].currHour === '08:00' || currHourReading[4][z].currHour == '8') {
                hour_eight = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '9:00' || currHourReading[4][z].currHour === '09:00' || currHourReading[4][z].currHour == '9') {
                hour_nine = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '10:00' || currHourReading[4][z].currHour === '10:00' || currHourReading[4][z].currHour == '10') {
                hour_ten = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '11:00' || currHourReading[4][z].currHour === '11:00' || currHourReading[4][z].currHour == '11') {
                hour_eleven = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '12:00' || currHourReading[4][z].currHour === '12:00' || currHourReading[4][z].currHour == '12') {
                hour_twelve = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '13:00' || currHourReading[4][z].currHour === '13:00' || currHourReading[4][z].currHour == '13') {
                hour_thirteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '14:00' || currHourReading[4][z].currHour === '14:00' || currHourReading[4][z].currHour == '14') {
                hour_fourteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '15:00' || currHourReading[4][z].currHour === '15:00' || currHourReading[4][z].currHour == '15') {
                hour_fifteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '16:00' || currHourReading[4][z].currHour === '16:00' || currHourReading[4][z].currHour == '16') {
                hour_sixteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '17:00' || currHourReading[4][z].currHour === '17:00' || currHourReading[4][z].currHour == '17') {
                hour_seventeen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '18:00' || currHourReading[4][z].currHour === '18:00' || currHourReading[4][z].currHour == '18') {
                hour_eighteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '19:00' || currHourReading[4][z].currHour === '19:00' || currHourReading[4][z].currHour == '19') {
                hour_nineteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '20:00' || currHourReading[4][z].currHour === '20:00' || currHourReading[4][z].currHour == '20') {
                hour_twenty = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '21:00' || currHourReading[4][z].currHour === '21:00' || currHourReading[4][z].currHour == '21') {
                hour_twentyone = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '22:00' || currHourReading[4][z].currHour === '22:00' || currHourReading[4][z].currHour == '22') {
                hour_twentytwo = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '23:00' || currHourReading[4][z].currHour === '23:00' || currHourReading[4][z].currHour == '23') {
                hour_twentythree = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '0:00' || currHourReading[4][z].currHour === '00:00' || currHourReading[4][z].currHour == '0') {
                hour_zero = currHourReading[4][z].currValue;
            }
        }
        let selectReading = `SELECT * FROM hour_readings 
        WHERE hour_readings.date = '${currDate}'
        AND client_id = '${currID}' AND energy_type = '${type}'`;
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
                let updateQuery = `UPDATE hour_readings SET`;
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
                updateQuery += `WHERE date = '${currDate}' AND client_id = ${currID} AND type = ${type};`;
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
                hour_twentytwo, hour_twentythree, hour_zero, type, createdDate, diff
            ];
            readingsFiltered.push(filteredHourReading);
        }
    }
    return readingsFiltered;
}

module.exports = router;