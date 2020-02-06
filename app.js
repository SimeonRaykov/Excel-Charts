const express = require('express');
const mysql = require('mysql');
const mysqlSync = require('sync-mysql');
const bodyParser = require('body-parser');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const {
    ensureAuthenticated
} = require('./config/auth');

// Passport config
require('./config/passport.js')(passport);
// EJS  
app.set('views', path.join(__dirname, 'views')); // add this one, change 'views' for your folder name if needed.
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Make bootstrap / ejs work with js and datable files
app.use(express.static('public'), express.static(__dirname + '/static'))
// Bodydparser
app.use(express.json({
    limit: '50mb'
}));
var jsonParser = bodyParser.json({
    limit: 1024 * 1024 * 20,
    type: 'application/json'
});
app.use(bodyParser.json({
    limit: '500mb'
}));
app.use(bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 500000
}));

var urlencodedParser = bodyParser.urlencoded({
    extended: true,
    limit: 1024 * 1024 * 20,
    type: 'application/x-www-form-urlencoded'
})

app.use(jsonParser);
app.use(urlencodedParser);

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    //  cookie: {secure: true}
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

let datavendPort = '192.168.1.114'

// PORT 
const PORT = process.env.PORT || 3000;
app.listen(PORT, datavendPort, console.log(`Server started on port ${PORT}`));

// DB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exceldata'
});

const dbSync = new mysqlSync({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exceldata'
})
app.disable('view cache');

const nocache = require('nocache');

app.use(nocache());
app.set('etag', false)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    next()
})

// Routing
app.use('/', require('./routes/dashboard'));
app.use('/users', require('./routes/users'));
app.use('/homepage', require('./routes/dashboard'));
app.use('/users', require('./routes/dashboard'));

// Create DB
app.get('/createDB', (req, res) => {
    let sql = 'CREATE DATABASE exceldata';

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('database created');
        console.log(result);
    });
});

// Get Readings

app.get('/listReadings', (req, res) => {

    let sql = `SELECT  clients.id AS clients_id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.id AS reading_id,client_number, ident_code, period_from, invoicing.time_zone, period_to, value_bgn, type
        FROM invoicing
        INNER JOIN clients
        ON invoicing.client_id = clients.id
        ORDER BY invoicing.id;`
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
});

app.get('/listReadings/:date_from/:to_date', (req, res) => {
    let date_from = req.params.date_from;
    let to_date = req.params.to_date;
    let sql = `SELECT clients.id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.time_zone, invoicing.id AS reading_id,client_number, ident_code, period_from, period_to, value_bgn, type
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id`;
    if (date_from != 'null' && to_date != 'null') {
        sql += ` WHERE invoicing.period_from >= '${date_from}' AND invoicing.period_to <= '${to_date}'`
    } else if (date_from != 'null') {
        sql += ` WHERE invoicing.period_from >= '${date_from}'`
    } else if (to_date != 'null') {
        sql += ` WHERE invoicing.period_to <= '${to_date}'`
    }
    sql += ' ORDER BY invoicing.id';

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
});

// Get Client Details
app.get('/getClientDetails/:id', (req, res) => {
    let client_id = req.params.id;
    let sql = `SELECT clients.id, clients.client_name, invoicing.operator AS operator, invoicing.time_zone, invoicing.id AS reading_id, period_from, period_to, value_bgn, type
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE client_id = '${client_id}';`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });

})

app.get('/getAllClientNamesDistinct', (req, res) => {
    let sql = `SELECT DISTINCT client_name FROM clients`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});


app.get('/getAllClientIDs&Names', (req, res) => {
    let sql = `SELECT DISTINCT clients.client_name, ident_code FROM clients`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });

})

app.post('/api/filterData', (req, res) => {

    let {
        date_from,
        to_date,
        id,
        name,
        ERP
    } = req.body;

    let sql = `SELECT clients.id, invoicing.operator AS operator, clients.ident_code, clients.client_name, invoicing.time_zone, invoicing.id AS invoicing_id,client_number, ident_code, period_from, period_to, value_bgn, type
    FROM invoicing
    INNER JOIN clients
    ON invoicing.client_id = clients.id
    WHERE 1=1 `;

    if (date_from != '' && to_date != '') {
        sql += ` AND invoicing.period_from >= '${date_from}' AND invoicing.period_to <= '${to_date}'`
    } else if (date_from != '') {
        sql += ` AND invoicing.period_from >= '${date_from}'`
    } else if (to_date != '') {
        sql += ` AND invoicing.period_to <= '${to_date}'`
    }
    if (name != '') {
        sql += ` AND clients.client_name = '"${name}"'`;
    }
    if (id != '') {
        sql += ` AND clients.ident_code = '${id}'`;
    }
    if (ERP === 'CEZ') {
        sql += ` AND invoicing.operator = '2'`;
    } else if (ERP === 'EVN') {
        sql += ` AND invoicing.operator = '1'`;
    } else if (ERP === 'EnergoPRO') {
        sql += ` AND invoicing.operator = '3'`;
    }
    sql += ' ORDER BY invoicing.id';
    console.log(sql);
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
})

// Get Single Reading Details

app.get('/getReadingDetails/:id', (req, res) => {
    let reading_id = req.params.id;
    let sql = `SELECT * FROM invoicing WHERE id ='${reading_id}';`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result[0]);
    });
})

// Create Table
app.get('/createposttable', (req, res) => {
    let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('table created');
        console.log(result);
        return result;
    });
});

// Insert Post 1
app.get('/addpost1', (req, res) => {
    let post = {
        title: 'Post one',
        body: 'This is post number one'
    };
    let sql = 'INSERT INTO posts SET ?';

    db.query(sql, post, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(`${post} added`);

    });
})

// Insert Clients 
app.post('/addclients', (req, res) => {
    let sql = 'INSERT IGNORE INTO clients (client_number, client_name, ident_code, metering_type, profile_id, erp_type, is_manufacturer ,date_created) VALUES ?';
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Clients inserted');
        return res.send("Clients added");
    });
})

// Insert Readings
app.post('/addreadings', (req, res) => {

    let sql = 'INSERT INTO invoicing (client_id, period_from, period_to, period_days, scale_number, scale_type, time_zone, readings_new, readings_old, diff, correction, deduction, total_qty, service, qty, price, value_bgn, type, operator) VALUES ?';
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Readings inserted');
        return res.send("Readings added");
    });
})

app.post('/api/addHourReadings', async (req, res) => {
    let readingsFiltered = await filterHourReadings(req.body);
    let sql = 'INSERT INTO hour_readings (client_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, type, created_date, diff) VALUES ?';
    db.query(sql, [readingsFiltered], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Hour Readings inserted');
        return res.send("Hour Readings added");
    });
})

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
        AND client_id = '${currID}' AND type = '${type}'`;
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

function checkIfFirstAndAddToInsertQuery(isFirst, updateQuery) {
    if (isFirst) {
        isFirst = false;
    } else if (!isFirst) {
        updateQuery += ' , ';
    }
    return [isFirst, updateQuery];
}

// Select posts
app.get('/getposts', (req, res) => {
    let sql = 'SELECT * FROM posts';
    db.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        console.log('Posts fetched');
    });
});

// Get clients
app.post('/getClient', (req, res) => {
    let sql = `SELECT * FROM clients WHERE ident_code IN (${req.body.join()})`;
    db.query(sql, req.body.join(), (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Clients get');
        return res.send(JSON.stringify(result));
    });
});

app.post('/api/getClients', (req, res) => {
    let sql = `SELECT * FROM clients WHERE ident_code IN (${req.body.join(', ')})`;
    db.query(sql, req.body.join(), (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Clients get');
        return res.send(JSON.stringify(result));
    });
});

app.get('/api/getAllClients/:type', (req, res) => {
    //  Hourly = 1
    //  STP = 2
    let sql = `SELECT id, client_name, ident_code FROM clients WHERE metering_type='${req.params.type}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

app.post('/api/filter/getAllHourReadingsTable', (req, res) => {

    let {
        date,
        name,
        ident_code,
        erp
    } = req.body;

    let sql = `SELECT hour_readings.id, clients.id as cId,clients.ident_code, clients.client_name, clients.erp_type, hour_readings.date, ( hour_one + hour_two + hour_three + hour_four + hour_five + hour_six + hour_seven + hour_eight + hour_nine + hour_ten + hour_eleven+ hour_twelve + hour_thirteen + hour_fourteen + hour_fifteen + hour_sixteen + hour_seventeen + hour_eighteen + hour_nineteen + hour_twenty + hour_twentyone + hour_twentytwo + hour_twentythree + hour_zero) as amount FROM hour_readings
    INNER JOIN clients ON clients.id = hour_readings.client_id 
    WHERE 1=1 `;
    if (date != '' && date != undefined) {
        sql += ` AND hour_readings.date = '${date}' `
    }
    if (name != '' && name != undefined) {
        sql += ` AND clients.client_name = '${name}'`;
    }
    if (ident_code != '' && ident_code != undefined) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
    }
    if (erp != '' && erp != undefined) {
        sql += ` AND clients.erp_type = '${erp}'`;
    }
    sql += ' ORDER BY hour_readings.id';
    console.log(sql);
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

// Calendar hour-listings
app.get('/api/hour-readings/getClient/:id', (req, res) => {
    let sql = `SELECT * FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
// Calendar imbalances
app.get('/api/imbalances/getClient/:id', (req, res) => {
    let sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_zero AS 'hr0',hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'phr0', hour_prediction.hour_one AS 'phr1',  hour_prediction.hour_two AS 'phr2', hour_prediction.hour_three AS 'phr3', hour_prediction.hour_four AS 'phr4', hour_prediction.hour_five AS 'phr5', hour_prediction.hour_six AS 'phr6', hour_prediction.hour_seven AS 'phr7', hour_prediction.hour_eight AS 'phr8', hour_prediction.hour_nine AS 'phr9', hour_prediction.hour_ten AS 'phr10', hour_prediction.hour_eleven AS 'phr11', hour_prediction.hour_twelve AS 'phr12', hour_prediction.hour_thirteen AS 'phr13', hour_prediction.hour_fourteen AS 'phr14', hour_prediction.hour_fifteen AS 'phr15', hour_prediction.hour_sixteen AS 'phr16', hour_prediction.hour_seventeen AS 'phr17', hour_prediction.hour_eighteen AS 'phr18', hour_prediction.hour_nineteen AS 'phr19', hour_prediction.hour_twenty AS 'phr20', hour_prediction.hour_twentyone AS 'phr21', hour_readings.hour_twentytwo AS 'phr22', hour_prediction.hour_twentythree AS 'phr23' FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    INNER JOIN hour_prediction on hour_prediction.client_id = clients.id
    WHERE clients.id = ${req.params.id}
    GROUP BY hour_prediction.date
`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

// Calendar graph predictions
app.get('/api/graph-predictions/getClient/:id', (req, res) => {
    let sql = `SELECT * FROM clients
    INNER JOIN hour_prediction on clients.id = hour_prediction.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

app.get('/api/hour-readings/daily/:id/:date', (req, res) => {
    let sql = `SELECT *,hour_readings.id AS hrID FROM hour_readings
    INNER JOIN clients on hour_readings.client_id = clients.id
    WHERE hour_readings.date = '${req.params.date}' AND hour_readings.id = '${req.params.id}'`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
})


//////////////////// PROFILE /////////////////////////

app.post('/api/createProfile', (req, res) => {
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

app.post('/api/getProfileID', (req, res) => {
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

app.post('/api/saveProfileReadings', async (req, res) => {
    let profileReadingsFiltered = await filterProfileHourReadings(req.body);
    let sql = 'INSERT INTO profile_coef (profile_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, created_date) VALUES ?';
    db.query(sql, [profileReadingsFiltered], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Hour Readings inserted');
        return res.send("Hour Readings added");
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
            if (currHourReading[2][z].currHour === '1:00' || currHourReading[2][z].currHour === '01:00' || currHourReading[2][z].currHour == 1) {
                hour_one = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '2:00' || currHourReading[2][z].currHour === '02:00' || currHourReading[2][z].currHour == 2) {
                hour_two = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '3:00' || currHourReading[2][z].currHour === '03:00' || currHourReading[2][z].currHour == 3) {
                hour_three = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '4:00' || currHourReading[2][z].currHour === '04:00' || currHourReading[2][z].currHour == 4) {
                hour_four = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '5:00' || currHourReading[2][z].currHour === '05:00' || currHourReading[2][z].currHour == 5) {
                hour_five = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '6:00' || currHourReading[2][z].currHour === '06:00' || currHourReading[2][z].currHour == 6) {
                hour_six = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '7:00' || currHourReading[2][z].currHour === '07:00' || currHourReading[2][z].currHour == 7) {
                hour_seven = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '8:00' || currHourReading[2][z].currHour === '08:00' || currHourReading[2][z].currHour == 8) {
                hour_eight = currHourReading[2][z].currValue
            } else if (currHourReading[2][z].currHour === '9:00' || currHourReading[2][z].currHour === '09:00' || currHourReading[2][z].currHour == 9) {
                hour_nine = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '10:00' || currHourReading[2][z].currHour === '10:00' || currHourReading[2][z].currHour == 10) {
                hour_ten = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '11:00' || currHourReading[2][z].currHour === '11:00' || currHourReading[2][z].currHour == 11) {
                hour_eleven = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '12:00' || currHourReading[2][z].currHour === '12:00' || currHourReading[2][z].currHour == 12) {
                hour_twelve = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '13:00' || currHourReading[2][z].currHour === '13:00' || currHourReading[2][z].currHour == 13) {
                hour_thirteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '14:00' || currHourReading[2][z].currHour === '14:00' || currHourReading[2][z].currHour == 14) {
                hour_fourteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '15:00' || currHourReading[2][z].currHour === '15:00' || currHourReading[2][z].currHour == 15) {
                hour_fifteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '16:00' || currHourReading[2][z].currHour === '16:00' || currHourReading[2][z].currHour == 16) {
                hour_sixteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '17:00' || currHourReading[2][z].currHour === '17:00' || currHourReading[2][z].currHour == 17) {
                hour_seventeen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '18:00' || currHourReading[2][z].currHour === '18:00' || currHourReading[2][z].currHour == 18) {
                hour_eighteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '19:00' || currHourReading[2][z].currHour === '19:00' || currHourReading[2][z].currHour == 19) {
                hour_nineteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '20:00' || currHourReading[2][z].currHour === '20:00' || currHourReading[2][z].currHour == 20) {
                hour_twenty = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '21:00' || currHourReading[2][z].currHour === '21:00' || currHourReading[2][z].currHour == 21) {
                hour_twentyone = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '22:00' || currHourReading[2][z].currHour === '22:00' || currHourReading[2][z].currHour == 22) {
                hour_twentytwo = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '23:00' || currHourReading[2][z].currHour === '23:00' || currHourReading[2][z].currHour == 23) {
                hour_twentythree = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '0:00' || currHourReading[2][z].currHour === '00:00' || currHourReading[2][z].currHour == 0) {
                hour_zero = currHourReading[2][z].currValue;
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


/////////////////// END OF PROFILE /////////////////////////



///////////////////////////////GRAPHS/////////////////////////////

app.post('/api/getSingleClient', (req, res) => {
    let ident_code = req.body.ident_code;
    let sql = `SELECT * FROM clients WHERE ident_code = '${ident_code}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        return res.send(JSON.stringify(result[0].id));
    });
});

app.post('/api/saveGraphHourReadings', async (req, res) => {
    let graphHourReadingsFiltered = await filterGraphHourReadings(req.body);
    let sql = 'INSERT INTO hour_prediction (client_id, date, hour_zero, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, type, erp, created_date) VALUES ?';
    db.query(sql, [graphHourReadingsFiltered], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Graph Hour Readings inserted');
        return res.send("Graph Hour Readings added");
    });
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
        hour_one = hour_two = hour_three = hour_four = hour_five = hour_six = hour_seven = hour_eight = hour_nine = hour_ten = hour_eleven = hour_twelve = hour_thirteen = hour_fourteen = hour_fifteen = hour_sixteen = hour_seventeen = hour_eighteen = hour_nineteen = hour_twenty = hour_twentyone = hour_twentytwo = hour_twentythree = hour_zero = -1;

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
            if (currHourReading[2][z].currHour === '1:00' || currHourReading[2][z].currHour === '01:00' || currHourReading[2][z].currHour == 1) {
                hour_one = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '2:00' || currHourReading[2][z].currHour === '02:00' || currHourReading[2][z].currHour == 2) {
                hour_two = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '3:00' || currHourReading[2][z].currHour === '03:00' || currHourReading[2][z].currHour == 3) {
                hour_three = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '4:00' || currHourReading[2][z].currHour === '04:00' || currHourReading[2][z].currHour == 4) {
                hour_four = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '5:00' || currHourReading[2][z].currHour === '05:00' || currHourReading[2][z].currHour == 5) {
                hour_five = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '6:00' || currHourReading[2][z].currHour === '06:00' || currHourReading[2][z].currHour == 6) {
                hour_six = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '7:00' || currHourReading[2][z].currHour === '07:00' || currHourReading[2][z].currHour == 7) {
                hour_seven = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '8:00' || currHourReading[2][z].currHour === '08:00' || currHourReading[2][z].currHour == 8) {
                hour_eight = currHourReading[2][z].currValue
            } else if (currHourReading[2][z].currHour === '9:00' || currHourReading[2][z].currHour === '09:00' || currHourReading[2][z].currHour == 9) {
                hour_nine = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '10:00' || currHourReading[2][z].currHour === '10:00' || currHourReading[2][z].currHour == 10) {
                hour_ten = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '11:00' || currHourReading[2][z].currHour === '11:00' || currHourReading[2][z].currHour == 11) {
                hour_eleven = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '12:00' || currHourReading[2][z].currHour === '12:00' || currHourReading[2][z].currHour == 12) {
                hour_twelve = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '13:00' || currHourReading[2][z].currHour === '13:00' || currHourReading[2][z].currHour == 13) {
                hour_thirteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '14:00' || currHourReading[2][z].currHour === '14:00' || currHourReading[2][z].currHour == 14) {
                hour_fourteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '15:00' || currHourReading[2][z].currHour === '15:00' || currHourReading[2][z].currHour == 15) {
                hour_fifteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '16:00' || currHourReading[2][z].currHour === '16:00' || currHourReading[2][z].currHour == 16) {
                hour_sixteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '17:00' || currHourReading[2][z].currHour === '17:00' || currHourReading[2][z].currHour == 17) {
                hour_seventeen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '18:00' || currHourReading[2][z].currHour === '18:00' || currHourReading[2][z].currHour == 18) {
                hour_eighteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '19:00' || currHourReading[2][z].currHour === '19:00' || currHourReading[2][z].currHour == 19) {
                hour_nineteen = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '20:00' || currHourReading[2][z].currHour === '20:00' || currHourReading[2][z].currHour == 20) {
                hour_twenty = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '21:00' || currHourReading[2][z].currHour === '21:00' || currHourReading[2][z].currHour == 21) {
                hour_twentyone = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '22:00' || currHourReading[2][z].currHour === '22:00' || currHourReading[2][z].currHour == 22) {
                hour_twentytwo = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '23:00' || currHourReading[2][z].currHour === '23:00' || currHourReading[2][z].currHour == 23) {
                hour_twentythree = currHourReading[2][z].currValue;
            } else if (currHourReading[2][z].currHour === '0:00' || currHourReading[2][z].currHour === '00:00' || currHourReading[2][z].currHour == 0) {
                hour_zero = currHourReading[2][z].currValue;
            }
        }
        let selectReading = `SELECT * FROM hour_prediction 
        WHERE hour_prediction.date = '${currDate}'
        AND client_id = '${currID}'`;
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


/////////////////////////////END OF GRAPHS////////////////////////



/////////////////////////// STP PREDICTIONS - MONTHLY //////////////////
app.post('/api/STP-Predictions', (req, res) => {
    let sql = 'INSERT IGNORE INTO prediction (client_id, date, amount, type, created_date) VALUES ?';
    let query = db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
    });
    // console.log(query.sql);  
    console.log('STP Predictions inserted');
    return res.send("STP Predictions added");
});

///////////////////////////END OF STP PREDICTIONS - MONTHLY ////////////


////////////////////////// STP LISTING DETAILS ////////////////////////

app.get('/api/getClientSTP/details/:id', (req, res) => {
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

app.get('/api/getClientSTP/details/datalist/:operator', (req, res) => {
    let operator = req.params.operator;
    let sql = `SELECT * FROM stp_profiles WHERE type = ${operator}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});



app.post('/api/saveClientSTPChanges/details/:id', async (req, res) => {
    const profileName = req.body.profileName;
    const isManufacturer = req.body.isManufacturer;
    const clientName = req.body.name;
    const clientID = req.params.id;
    let selectProfileSQL = `SELECT id FROM stp_profiles
    WHERE profile_name = '${profileName}'
    LIMIT 1`;
    let resultProfile = await dbSync.query(selectProfileSQL)
    let profileID = resultProfile[0].id;
    let sql = `UPDATE clients SET profile_id = ${profileID},client_name = '${clientName}' , is_manufacturer= ${isManufacturer} WHERE id=${clientID}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});

////////////////////////// STP LISTING DETAILS /////////////////////////////


////////////////////////// STP FILTER CLIENTS BY ERP ///////////////////////
app.get('/api/filterSTPClientsByERP/:value', (req, res) => {
    // metering type = 2 STP!
    let erpValue = req.params.value;
    let sql = `SELECT DISTINCT clients.ident_code, clients.client_name, clients.id FROM clients 
    INNER JOIN invoicing ON invoicing.client_id = clients.id
    WHERE operator = ${erpValue} AND metering_type = 2;`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
////////////////////////// STP FILTER CLIENTS BY ERP ///////////////////////


///////////////////////// Graph - STP //////////////////////////////////////

app.get('/api/graph-STP/getAllClients', (req, res) => {
    let sql = `SELECT * FROM clients 
    WHERE clients.profile_id != 0`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

app.get('/api/graph-STP/getInfoForSingleClient/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT profile_coef.date AS profileDate ,clients.ident_code, profile_coef.hour_zero AS'hr0', profile_coef.hour_one AS'hr1',profile_coef.hour_two AS'hr2',profile_coef.hour_three AS'hr3',profile_coef.hour_four AS'hr4',profile_coef.hour_five AS'hr5',profile_coef.hour_six AS'hr6',profile_coef.hour_seven AS'hr7',profile_coef.hour_eight AS'hr8',profile_coef.hour_nine AS'hr9',profile_coef.hour_ten AS'hr10',profile_coef.hour_eleven AS'hr11',profile_coef.hour_twelve AS'hr12',profile_coef.hour_thirteen AS'hr13',profile_coef.hour_fourteen AS'hr14',profile_coef.hour_fifteen AS'hr15',profile_coef.hour_sixteen AS'hr16',profile_coef.hour_seventeen AS'hr17',profile_coef.hour_eighteen AS'hr18',profile_coef.hour_nineteen AS'hr19',profile_coef.hour_twentyone AS'hr20',profile_coef.hour_twentyone AS'hr21',profile_coef.hour_twentytwo AS'hr22',profile_coef.hour_twentythree AS'hr23', prediction.amount FROM clients 
    INNER JOIN prediction on clients.id = prediction.client_id
    INNER JOIN profile_coef on profile_coef.profile_id = clients.profile_id
    WHERE clients.id = ${id}
    AND MONTH(profile_coef.date) = MONTH(prediction.date)
    AND YEAR(profile_coef.date) = YEAR(prediction.date)`
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
})

//////////////////////// Graph - STP ///////////////////////////////////////
// Update post
app.get('/updatepost/:id', (req, res) => {
    let newTitle = 'new title';
    let sql = `UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Post updated');
        console.log(result);
    });
});

// Delete post
app.get('/deletepost/:id', (req, res) => {
    let sql = `DELETE from posts WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Post deleted');
        console.log(result);
    });
});


//  Clients
app.get('/api/getAllClients', (req, res) => {
    let sql = `SELECT clients.id, client_name, ident_code, metering_type FROM clients`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        res.send(result);
    });
});

app.get('/api/filterClients/:erp_type/:metering_type', (req, res) => {
    let erpType = req.params.erp_type;
    let meteringType = req.params.metering_type;

    let sql = `SELECT clients.id, client_name, ident_code, metering_type, erp_type FROM clients
    WHERE 1=1 `;

    if (erpType != 'all') {
        if (erpType.length == 1) {
            sql += ` AND erp_type = ${erpType}`;
        } else {
            let splitted = erpType.split(',');
            for (let i = 0; i < splitted.length; i += 1) {
                if (i == 0) {
                    sql += ` AND erp_type = ${splitted[i]}`;
                } else {
                    sql += ` OR erp_type = ${splitted[i]}`;
                }
            }
        }

    }
    if (meteringType != 'all') {
        if (meteringType.split(",").length != 2) {
            sql += ` AND metering_type = ${meteringType}`;
        }
    }

    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        res.send(result);
    });
});

app.get('/api/getClientInfo/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT clients.id, stp_profiles.profile_name, client_name, ident_code, metering_type, is_manufacturer, profile_id, erp_type FROM clients
    INNER JOIN stp_profiles on clients.profile_id = stp_profiles.id
    WHERE clients.id = ${clientID}`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        if (!result || result == '' || result == undefined || result == null) {
            sql = `SELECT clients.id, client_name, ident_code, metering_type, is_manufacturer, profile_id, erp_type FROM clients
            WHERE clients.id = ${clientID}`;
            db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                }
                return res.send(result[0]);
            })
        } else {
            console.log(2);
            return res.send(result[0]);
        }
    });
});

app.get('/api/hour-readings/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, hour_readings.date, hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_readings.hour_zero AS 'hr24'FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        res.send(result);
    });
});

app.get('/api/graph-predictions/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, hour_prediction.date, hour_prediction.hour_one AS 'hr1',  hour_prediction.hour_two AS 'hr2', hour_prediction.hour_three AS 'hr3', hour_prediction.hour_four AS 'hr4', hour_prediction.hour_five AS 'hr5', hour_prediction.hour_six AS 'hr6', hour_prediction.hour_seven AS 'hr7', hour_prediction.hour_eight AS 'hr8', hour_prediction.hour_nine AS 'hr9', hour_prediction.hour_ten AS 'hr10', hour_prediction.hour_eleven AS 'hr11', hour_prediction.hour_twelve AS 'hr12', hour_prediction.hour_thirteen AS 'hr13', hour_prediction.hour_fourteen AS 'hr14', hour_prediction.hour_fifteen AS 'hr15', hour_prediction.hour_sixteen AS 'hr16', hour_prediction.hour_seventeen AS 'hr17', hour_prediction.hour_eighteen AS 'hr18', hour_prediction.hour_nineteen AS 'hr19', hour_prediction.hour_twenty AS 'hr20', hour_prediction.hour_twentyone AS 'hr21', hour_prediction.hour_twentytwo AS 'hr22', hour_prediction.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'hr24'FROM clients
    INNER JOIN hour_prediction on clients.id = hour_prediction.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        res.send(result);
    });
});


app.get('/api/imbalances/getClient/:fromDate/:toDate/:id', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.id;
    let sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_zero AS 'hr0',hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'phr0', hour_prediction.hour_one AS 'phr1',  hour_prediction.hour_two AS 'phr2', hour_prediction.hour_three AS 'phr3', hour_prediction.hour_four AS 'phr4', hour_prediction.hour_five AS 'phr5', hour_prediction.hour_six AS 'phr6', hour_prediction.hour_seven AS 'phr7', hour_prediction.hour_eight AS 'phr8', hour_prediction.hour_nine AS 'phr9', hour_prediction.hour_ten AS 'phr10', hour_prediction.hour_eleven AS 'phr11', hour_prediction.hour_twelve AS 'phr12', hour_prediction.hour_thirteen AS 'phr13', hour_prediction.hour_fourteen AS 'phr14', hour_prediction.hour_fifteen AS 'phr15', hour_prediction.hour_sixteen AS 'phr16', hour_prediction.hour_seventeen AS 'phr17', hour_prediction.hour_eighteen AS 'phr18', hour_prediction.hour_nineteen AS 'phr19', hour_prediction.hour_twenty AS 'phr20', hour_prediction.hour_twentyone AS 'phr21', hour_readings.hour_twentytwo AS 'phr22', hour_prediction.hour_twentythree AS 'phr23' FROM clients
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
    sql += ` GROUP BY hour_prediction.date`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});



// import stp hour-readings
app.post('/api/addSTPHourReadings', async (req, res) => {
    let stpHourReadingsFiltered = await filterSTPHourReadings(req.body);
    console.log(stpHourReadingsFiltered);
    let sql = 'INSERT INTO stp_hour_readings (client_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, erp_type, diff, created_date) VALUES ?';
    db.query(sql, [stpHourReadingsFiltered], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('STP Hour Readings inserted');
        return res.send("STP Hour Readings added");
    });
});

async function filterSTPHourReadings(hour_readingsAll) {
    let readingsFiltered = [];
    let addToFinalReadings;
    for (let i = 0; i < hour_readingsAll.length; i += 1) {
     //   if(i==20){
    //        break;
     //   }
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
        let selectReading = `SELECT * FROM stp_hour_readings 
        WHERE stp_hour_readings.date = '${currDate}'
        AND client_id = '${currID}' AND erp_type = '${erp_type}'`;
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
                let updateQuery = `UPDATE stp_hour_readings SET`;
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
                updateQuery += `WHERE date = '${currDate}' AND client_id = ${currID} AND type = ${erp_type};`;
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
                hour_twentytwo, hour_twentythree, hour_zero, erp_type, diff, createdDate
            ];
            readingsFiltered.push(filteredHourReading);
        }
    }
    console.log(readingsFiltered);
    return readingsFiltered;
};

// Connect to DB
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Mysql connected');
});
exports.db = db;
exports.dbSync = dbSync;