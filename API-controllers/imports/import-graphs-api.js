const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/getSingleClient', (req, res) => {
    let ident_code = req.body.ident_code;
    let sql = `SELECT * FROM clients WHERE ident_code = '${ident_code}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result[0].id));
    });
});

router.post('/api/saveGraphHourReadings', async (req, res) => {
    let graphHourReadingsFiltered = await filterGraphHourReadings(req.body);

    if (graphHourReadingsFiltered != [] && graphHourReadingsFiltered != '' && graphHourReadingsFiltered != undefined && graphHourReadingsFiltered != null) {
        let sql = `INSERT INTO hour_prediction (client_id, date, hour_zero, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, type, erp, created_date) VALUES ? 
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
       hour_twentythree = VALUES(hour_twentythree)`;
        db.query(sql, [graphHourReadingsFiltered], (err, result) => {
            if (err) {
                throw err;
            }
            console.log('Данните за графици са качени в базата');
            return res.send("Данните за графици са качени в базата");
        });
    } else {
        console.log('Данните вече съществуват / Грешка');
        return res.send('Данните вече съществуват / Грешка');
    }
});


router.post('/api/saveESOGraphPredictions', async (req, res) => {
    let graphPredictionsESOFiltered = await filterESOGraphPredictions(req.body);

    if (graphPredictionsESOFiltered != [] && graphPredictionsESOFiltered != '' && graphPredictionsESOFiltered != undefined && graphPredictionsESOFiltered != null) {
        let sql = `INSERT INTO hour_prediction_eso (client_id, date, hour_zero, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, created_date) VALUES ? 
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
        db.query(sql, [graphPredictionsESOFiltered], (err, result) => {
            if (err) {
                throw err;
            }
            console.log('Данните за графици са качени в базата');
            return res.send("Данните за графици са качени в базата");
        });
    } else {
        console.log('Данните вече съществуват / Грешка');
        return res.send('Данните вече съществуват / Грешка');
    }
});

async function filterGraphHourReadings(allProfileHourReadings) {
    let readingsFiltered = [];
    let addToFinalReadings;
    for (let i = 0; i < allProfileHourReadings.length; i += 1) {
        addToFinalReadings = true;
        let currHourReading = allProfileHourReadings[i];
        let hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight,
            hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen,
            hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
            hour_twentytwo, hour_twentythree, hour_zero;
        hour_one = hour_two = hour_three = hour_four = hour_five = hour_six = hour_seven = hour_eight = hour_nine = hour_ten = hour_eleven = hour_twelve = hour_thirteen = hour_fourteen = hour_fifteen = hour_sixteen = hour_seventeen = hour_eighteen = hour_nineteen = hour_twenty = hour_twentyone = hour_twentytwo = hour_twentythree = hour_zero = null;

        let filteredHourReading = [];
        let currID = currHourReading[0];
        let date = currHourReading[1].split('-');
        let helperDate = new Date(currHourReading[1]);
        let currDate = `${helperDate.getFullYear()}-${helperDate.getMonth()+1}-${helperDate.getDate()}`;
        let type = currHourReading[3];
        let ERP = currHourReading[4];
        if (currDate.includes('undefined')) {
            currDate = `${date[0].split('.')[2]}-${date[0].split('.')[1]}-${date[0].split('.')[0]}`
        }
        let createdDate = currHourReading[5];
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
        /* let selectReading = `SELECT * FROM hour_prediction 
        WHERE hour_prediction.date = '${currDate}'
        AND client_id = '${currID}'`;
        let result = dbSync.query(selectReading);
        if (result.length != 0 && result[0] != undefined && result[0].length != 0) {
            if (result[0].hour_one != null && result[0].hour_two != null && result[0].hour_three != null && result[0].hour_four != null && result[0].hour_five != null && result[0].hour_six != null && result[0].hour_seven != null && result[0].hour_eight != null && result[0].hour_nine != null && result[0].hour_ten != null && result[0].hour_eleven != null && result[0].hour_twelve != null && result[0].hour_thirteen != null && result[0].hour_fourteen != null && result[0].hour_fifteen != null && result[0].hour_sixteen != null && result[0].hour_seventeen != null && result[0].hour_eighteen != null && result[0].hour_nineteen != null && result[0].hour_twenty != null && result[0].hour_twentyone != null && result[0].hour_twentytwo != null && result[0].hour_twentythree != null && result[0].hour_zero != null) {
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
                let updateQuery = `UPDATE hour_prediction SET`;
                if (result[0].hour_one == null && result[0].hour_one != hour_one) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_one = '${hour_one}' `;
                    isChanged = true;
                }
                if (result[0].hour_two == null && result[0].hour_two != hour_two) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_two = '${hour_two}' `;
                    isChanged = true;
                }
                if (result[0].hour_three == null != result[0].hour_three != hour_three) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_three = '${hour_three}' `;
                    isChanged = true;
                }
                if (result[0].hour_four == null && result[0].hour_four != hour_four) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_four = '${hour_four}' `;
                    isChanged = true;
                }
                if (result[0].hour_five == null && result[0].hour_five != hour_five) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_five = '${hour_five}' `;
                    isChanged = true;
                }
                if (result[0].hour_six == null && result[0].hour_six != hour_six) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_six = '${hour_six}' `;
                    isChanged = true;
                }
                if (result[0].hour_seven == null && result[0].hour_seven != hour_seven) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_seven = '${hour_seven}' `;
                    isChanged = true;
                }
                if (result[0].hour_eight == null && result[0].hour_eight != hour_eight) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_eight = '${hour_eight}' `;
                    isChanged = true;
                }
                if (result[0].hour_nine == null && result[0].hour_nine != hour_nine) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_nine = '${hour_nine}' `;
                    isChanged = true;
                }
                if (result[0].hour_ten == null && result[0].hour_ten != hour_ten) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_ten = '${hour_ten}' `;
                    isChanged = true;
                }
                if (result[0].hour_eleven == null && result[0].hour_eleven != hour_eleven) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_eleven = '${hour_eleven}' `;
                    isChanged = true;
                }
                if (result[0].hour_twelve == null && result[0].hour_twelve != hour_twelve) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twelve = '${hour_twelve}' `;
                    isChanged = true;
                }
                if (result[0].hour_thirteen == null && result[0].hour_thirteen != hour_thirteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_thirteen = '${hour_thirteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_fourteen == null && result[0].hour_fourteen != hour_fourteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_fourteen = '${hour_fourteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_fifteen == null && result[0].hour_fifteen != hour_fifteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_fifteen = '${hour_fifteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_sixteen == null && result[0].hour_sixteen != hour_sixteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_sixteen = '${hour_sixteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_seventeen == null && result[0].hour_seventeen != hour_seventeen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_seventeen = '${hour_seventeen}' `;
                    isChanged = true;
                }
                if (result[0].hour_eighteen == null && result[0].hour_eighteen != hour_eighteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_eighteen = '${hour_eighteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_nineteen == null && result[0].hour_nineteen != hour_nineteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_nineteen = '${hour_nineteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_twenty == null && result[0].hour_twenty != hour_twenty) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twenty = '${hour_twenty}' `;
                    isChanged = true;
                }
                if (result[0].hour_twentyone == null && result[0].hour_twentyone != hour_twentyone) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twentyone = '${hour_twentyone}' `;
                    isChanged = true;
                }
                if (result[0].hour_twentytwo == null && result[0].hour_twentytwo != hour_twentytwo) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twentytwo = '${hour_twentytwo}' `;
                    isChanged = true;
                }
                if (result[0].hour_twentythree == null && result[0].hour_twentythree != hour_twentythree) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twentythree = '${hour_twentythree}' `;
                    isChanged = true;
                }
                if (result[0].hour_zero == null && result[0].hour_zero != hour_zero) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += `hour_zero = '${hour_zero}' `;
                    isChanged = true;
                }
                updateQuery += `WHERE date = '${currDate}' AND client_id = ${currID};`;
                if (isChanged) {
                    dbSync.query(updateQuery);
                    addToFinalReadings = false;
                }
            }
        } else {
            // Insert row for first time
            addToFinalReadings = true;
        } */
        if (addToFinalReadings) {
            filteredHourReading = [currID, currDate, hour_zero, hour_one, hour_two, hour_three, hour_four,
                hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven,
                hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen,
                hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
                hour_twentytwo, hour_twentythree, type, ERP, createdDate
            ];
            readingsFiltered.push(filteredHourReading);
        }
    }
    return readingsFiltered;
}

async function filterESOGraphPredictions(allProfileHourReadings) {
    let readingsFiltered = [];
    let addToFinalReadings;
    for (let i = 0; i < allProfileHourReadings.length; i += 1) {
        addToFinalReadings = true;
        let currHourReading = allProfileHourReadings[i];
        let hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight,
            hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen,
            hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
            hour_twentytwo, hour_twentythree, hour_zero;
        hour_one = hour_two = hour_three = hour_four = hour_five = hour_six = hour_seven = hour_eight = hour_nine = hour_ten = hour_eleven = hour_twelve = hour_thirteen = hour_fourteen = hour_fifteen = hour_sixteen = hour_seventeen = hour_eighteen = hour_nineteen = hour_twenty = hour_twentyone = hour_twentytwo = hour_twentythree = hour_zero = null;

        let filteredHourReading = [];
        let currID = currHourReading[0];
        let date = currHourReading[1].split('-');
        let helperDate = new Date(currHourReading[1]);
        let currDate = `${helperDate.getFullYear()}-${helperDate.getMonth()+1}-${helperDate.getDate()}`;
        if (currDate.includes('undefined')) {
            currDate = `${date[0].split('.')[2]}-${date[0].split('.')[1]}-${date[0].split('.')[0]}`
        }
        let createdDate = currHourReading[4];
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
        let selectReading = `SELECT * FROM hour_prediction_eso
        WHERE hour_prediction_eso.date = '${currDate}'
        AND client_id = '${currID}'`;
        let result = dbSync.query(selectReading);
        if (result.length != 0 && result[0] != undefined && result[0].length != 0) {
            if (result[0].hour_one != null && result[0].hour_two != null && result[0].hour_three != null && result[0].hour_four != null && result[0].hour_five != null && result[0].hour_six != null && result[0].hour_seven != null && result[0].hour_eight != null && result[0].hour_nine != null && result[0].hour_ten != null && result[0].hour_eleven != null && result[0].hour_twelve != null && result[0].hour_thirteen != null && result[0].hour_fourteen != null && result[0].hour_fifteen != null && result[0].hour_sixteen != null && result[0].hour_seventeen != null && result[0].hour_eighteen != null && result[0].hour_nineteen != null && result[0].hour_twenty != null && result[0].hour_twentyone != null && result[0].hour_twentytwo != null && result[0].hour_twentythree != null && result[0].hour_zero != null) {
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
                let updateQuery = `UPDATE hour_prediction_eso SET`;
                if (result[0].hour_one == null && result[0].hour_one != hour_one) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_one = '${hour_one}' `;
                    isChanged = true;
                }
                if (result[0].hour_two == null && result[0].hour_two != hour_two) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_two = '${hour_two}' `;
                    isChanged = true;
                }
                if (result[0].hour_three == null != result[0].hour_three != hour_three) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_three = '${hour_three}' `;
                    isChanged = true;
                }
                if (result[0].hour_four == null && result[0].hour_four != hour_four) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_four = '${hour_four}' `;
                    isChanged = true;
                }
                if (result[0].hour_five == null && result[0].hour_five != hour_five) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_five = '${hour_five}' `;
                    isChanged = true;
                }
                if (result[0].hour_six == null && result[0].hour_six != hour_six) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_six = '${hour_six}' `;
                    isChanged = true;
                }
                if (result[0].hour_seven == null && result[0].hour_seven != hour_seven) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_seven = '${hour_seven}' `;
                    isChanged = true;
                }
                if (result[0].hour_eight == null && result[0].hour_eight != hour_eight) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_eight = '${hour_eight}' `;
                    isChanged = true;
                }
                if (result[0].hour_nine == null && result[0].hour_nine != hour_nine) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_nine = '${hour_nine}' `;
                    isChanged = true;
                }
                if (result[0].hour_ten == null && result[0].hour_ten != hour_ten) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_ten = '${hour_ten}' `;
                    isChanged = true;
                }
                if (result[0].hour_eleven == null && result[0].hour_eleven != hour_eleven) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_eleven = '${hour_eleven}' `;
                    isChanged = true;
                }
                if (result[0].hour_twelve == null && result[0].hour_twelve != hour_twelve) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twelve = '${hour_twelve}' `;
                    isChanged = true;
                }
                if (result[0].hour_thirteen == null && result[0].hour_thirteen != hour_thirteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_thirteen = '${hour_thirteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_fourteen == null && result[0].hour_fourteen != hour_fourteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_fourteen = '${hour_fourteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_fifteen == null && result[0].hour_fifteen != hour_fifteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_fifteen = '${hour_fifteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_sixteen == null && result[0].hour_sixteen != hour_sixteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_sixteen = '${hour_sixteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_seventeen == null && result[0].hour_seventeen != hour_seventeen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_seventeen = '${hour_seventeen}' `;
                    isChanged = true;
                }
                if (result[0].hour_eighteen == null && result[0].hour_eighteen != hour_eighteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_eighteen = '${hour_eighteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_nineteen == null && result[0].hour_nineteen != hour_nineteen) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_nineteen = '${hour_nineteen}' `;
                    isChanged = true;
                }
                if (result[0].hour_twenty == null && result[0].hour_twenty != hour_twenty) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twenty = '${hour_twenty}' `;
                    isChanged = true;
                }
                if (result[0].hour_twentyone == null && result[0].hour_twentyone != hour_twentyone) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twentyone = '${hour_twentyone}' `;
                    isChanged = true;
                }
                if (result[0].hour_twentytwo == null && result[0].hour_twentytwo != hour_twentytwo) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twentytwo = '${hour_twentytwo}' `;
                    isChanged = true;
                }
                if (result[0].hour_twentythree == null && result[0].hour_twentythree != hour_twentythree) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += ` hour_twentythree = '${hour_twentythree}' `;
                    isChanged = true;
                }
                if (result[0].hour_zero == null && result[0].hour_zero != hour_zero) {
                    updateQuery = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[1];
                    isFirst = checkIfFirstAndAddToInsertQuery(isFirst, updateQuery)[0];
                    updateQuery += `hour_zero = '${hour_zero}' `;
                    isChanged = true;
                }
                updateQuery += `WHERE date = '${currDate}' AND client_id = ${currID};`;
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
            filteredHourReading = [currID, currDate, hour_zero, hour_one, hour_two, hour_three, hour_four,
                hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven,
                hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen,
                hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
                hour_twentytwo, hour_twentythree, createdDate
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