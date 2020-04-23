const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/addSTPHourReadings', async (req, res) => {
    let stpHourReadingsFiltered = await filterSTPHourReadings(req.body);
    if (stpHourReadingsFiltered.length == 0) {
        return res.send("0 STP Hour Readings added");
    }
    let sql = 'INSERT INTO stp_hour_readings (client_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, erp_type, diff, created_date) VALUES ?';
    db.query(sql, [stpHourReadingsFiltered], (err, result) => {
        if (err) {
            return res.send('Данните вече съществуват / Грешка')
        }
        else{
        console.log('Данните за СТП Почасови са качени в базата');
        return res.send("Данните за СТП Почасови са качени в базата");
        } 
    });
});

async function filterSTPHourReadings(hour_readingsAll) {
    let readingsFiltered = [];
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
        let erp_type = currHourReading[5];
        let date = new Date(currHourReading[3]);
        let currDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        if (currDate.includes('undefined')) {
            currDate = `${date[0].split('.')[2]}-${date[0].split('.')[1]}-${date[0].split('.')[0]}`
        }
        let createdDate = currHourReading[6];
        for (let z = 0; z < currHourReading[4].length; z += 1) {
            switch (currHourReading[4][z].currHour) {
                case '1:00':
                case '01:00':
                case 1:
                    hour_one = currHourReading[4][z].currValue;
                    break;
                case '2:00':
                case '02:00':
                case 2:
                    hour_two = currHourReading[4][z].currValue;
                    break;
                case '3:00':
                case '03:00':
                case 3:
                    hour_three = currHourReading[4][z].currValue;
                    break;
                case '4:00':
                case '04:00':
                case 4:
                    hour_four = currHourReading[4][z].currValue;
                    break;
                case '5:00':
                case '05:00':
                case 5:
                    hour_five = currHourReading[4][z].currValue;
                    break;
                case '6:00':
                case '06:00':
                case 6:
                    hour_six = currHourReading[4][z].currValue;
                    break;
                case '7:00':
                case '07:00':
                case 7:
                    hour_seven = currHourReading[4][z].currValue;
                    break;
                case '8:00':
                case '08:00':
                case 8:
                    hour_eight = currHourReading[4][z].currValue;
                    break;
                case '9:00':
                case '09:00':
                case 9:
                    hour_nine = currHourReading[4][z].currValue;
                    break;
                case '10:00':
                case 10:
                    hour_ten = currHourReading[4][z].currValue;
                    break;
                case '11:00':
                case 11:
                    hour_eleven = currHourReading[4][z].currValue;
                    break;
                case '12:00':
                case 12:
                    hour_twelve = currHourReading[4][z].currValue;
                    break;
                case '13:00':
                case 13:
                    hour_thirteen = currHourReading[4][z].currValue;
                    break;
                case '14:00':
                case 14:
                    hour_fourteen = currHourReading[4][z].currValue;
                    break;
                case '15:00':
                case 15:
                    hour_fifteen = currHourReading[4][z].currValue;
                    break;
                case '16:00':
                case 16:
                    hour_sixteen = currHourReading[4][z].currValue;
                    break;
                case '17:00':
                case 17:
                    hour_seventeen = currHourReading[4][z].currValue;
                    break;
                case '18:00':
                case 18:
                    hour_eighteen = currHourReading[4][z].currValue;
                    break;
                case '19:00':
                case 19:
                    hour_nineteen = currHourReading[4][z].currValue;
                    break;
                case '20:00':
                case 20:
                    hour_twenty = currHourReading[4][z].currValue;
                    break;
                case '21:00':
                case 21:
                    hour_twentyone = currHourReading[4][z].currValue;
                    break;
                case '22:00':
                case 22:
                    hour_twentytwo = currHourReading[4][z].currValue;
                    break;
                case '23:00':
                case 23:
                    hour_twentythree = currHourReading[4][z].currValue;
                    break;
                case '0:00':
                case '00:00':
                case 0:
                    hour_zero = currHourReading[4][z].currValue;
                    break;
            }
        }
        filteredHourReading = [currID, currDate, hour_one, hour_two, hour_three, hour_four,
            hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven,
            hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen,
            hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
            hour_twentytwo, hour_twentythree, hour_zero, erp_type, diff, createdDate
        ];
        readingsFiltered.push(filteredHourReading);

    }
    return readingsFiltered;
};

module.exports = router;