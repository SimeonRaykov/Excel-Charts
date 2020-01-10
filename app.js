const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// Passport config
require('./config/passport.js')(passport);

// EJS  
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Make bootstrap / ejs work with js and datable files
app.use(express.static('public'))

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

// PORT
const PORT = process.env.PORT || 3000 || '192.168.1.114';
app.listen(PORT, console.log(`Server started on port ${PORT}`));

// DB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exceldata'
});


// Routing
app.use('/', require('./routes/dashboard'));
app.use('/homepage', require('./routes/dashboard'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/users', require('./routes/users'));

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

    let sql = `SELECT  clients.id AS clients_id, readings.operator AS operator, clients.ident_code, clients.client_name, readings.id AS reading_id,client_number, ident_code, period_from, readings.time_zone, period_to, value_bgn, type
        FROM readings
        INNER JOIN clients
        ON readings.client_id = clients.id
        ORDER BY readings.id;`
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
    let sql = `SELECT clients.id, readings.operator AS operator, clients.ident_code, clients.client_name, readings.time_zone, readings.id AS reading_id,client_number, ident_code, period_from, period_to, value_bgn, type
    FROM readings
    INNER JOIN clients
    ON readings.client_id = clients.id`;
    if (date_from != 'null' && to_date != 'null') {
        sql += ` WHERE readings.period_from >= '${date_from}' AND readings.period_to <= '${to_date}'`
    } else if (date_from != 'null') {
        sql += ` WHERE readings.period_from >= '${date_from}'`
    } else if (to_date != 'null') {
        sql += ` WHERE readings.period_to <= '${to_date}'`
    }
    sql += ' ORDER BY readings.id';

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
    let sql = `SELECT clients.id, clients.client_name, readings.operator AS operator, readings.time_zone, readings.id AS reading_id, period_from, period_to, value_bgn, type
    FROM readings
    INNER JOIN clients
    ON readings.client_id = clients.id
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

    let sql = `SELECT clients.id, readings.operator AS operator, clients.ident_code, clients.client_name, readings.time_zone, readings.id AS reading_id,client_number, ident_code, period_from, period_to, value_bgn, type
    FROM readings
    INNER JOIN clients
    ON readings.client_id = clients.id`;

    let ifFirst = true;

    function checkIfFirstWhereSQL() {
        if (ifFirst) {
            sql += ` WHERE`;
            ifFirst = false;
        } else {
            sql += ` AND `;
        }
    }

    if (date_from != '' && to_date != '') {
        checkIfFirstWhereSQL();
        sql += ` readings.period_from >= '${date_from}' AND readings.period_to <= '${to_date}'`
    } else if (date_from != '') {
        checkIfFirstWhereSQL();
        sql += ` readings.period_from >= '${date_from}'`
    } else if (to_date != '') {
        checkIfFirstWhereSQL();
        sql += ` readings.period_to <= '${to_date}'`
    }
    if (name != '') {
        checkIfFirstWhereSQL();
        sql += ` clients.client_name = '"${name}"'`;
    }
    if (id != '') {
        checkIfFirstWhereSQL();
        sql += ` clients.ident_code = '${id}'`;
    }
    if (ERP === 'CEZ') {
        checkIfFirstWhereSQL();
        sql += ` readings.operator = '2'`;
    } else if (ERP === 'EVN') {
        checkIfFirstWhereSQL();
        sql += ` readings.operator = '1'`;
    } else if (ERP === 'EnergoPRO') {
        checkIfFirstWhereSQL();
        sql += ` readings.operator = '3'`;
    }
    sql += ' ORDER BY readings.id';
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
    let sql = `SELECT * FROM readings WHERE id ='${reading_id}';`;

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

    let sql = 'INSERT IGNORE INTO clients (client_number, client_name, ident_code, date_created) VALUES ?';
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

    let sql = 'INSERT INTO readings (client_id, period_from, period_to, period_days, scale_number, scale_type, time_zone, readings_new, readings_old, diff, correction, deduction, total_qty, service, qty, price, value_bgn, type, operator) VALUES ?';
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }

        console.log('Readings inserted');
        return res.send("Readings added");
    });
})

app.post('/api/addHourReadings', (req, res) => {
    let readingsFiltered = filterHourReadings(req.body);
    let sql = 'INSERT INTO hour_readings (client_id, date, hour_one, hour_two, hour_three, hour_four, hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven, hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen, hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone, hour_twentytwo, hour_twentythree, hour_zero, type, created_date) VALUES ?';
    db.query(sql, [readingsFiltered], (err, result) => {
        if (err) {
            throw err;
        }

        console.log('Hour Readings inserted');
        return res.send("Hour Readings added");
    });

})

function filterHourReadings(hour_readingsAll) {
    let readingsFiltered = [];
    for (let i = 0; i < hour_readingsAll.length; i += 1) {
        let addToFinalReadings = true;
        let currHourReading = hour_readingsAll[i];
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
        let currID = currHourReading[1];
        let type = currHourReading[2];
        let date = currHourReading[3].split('/');
        let currDate = `${date[2]}-${date[0]}-${date[1]}`;
        if (currDate.includes('undefined')) {
            currDate = `${date[0].split('.')[2]}-${date[0].split('.')[1]}-${date[0].split('.')[0]}`
        }
        let createdDate = currHourReading[5];
        for (let z = 0; z < currHourReading[4].length; z += 1) {
            if (currHourReading[4][z].currHour === '1:00' || currHourReading[4][z].currHour === '01:00') {
                hour_one = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '2:00' || currHourReading[4][z].currHour === '02:00') {
                hour_two = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '3:00' || currHourReading[4][z].currHour === '03:00') {
                hour_three = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '4:00' || currHourReading[4][z].currHour === '04:00') {
                hour_four = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '5:00' || currHourReading[4][z].currHour === '05:00') {
                hour_five = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '6:00' || currHourReading[4][z].currHour === '06:00') {
                hour_six = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '7:00' || currHourReading[4][z].currHour === '07:00') {
                hour_seven = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '8:00' || currHourReading[4][z].currHour === '08:00') {
                hour_eight = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '9:00' || currHourReading[4][z].currHour === '09:00') {
                hour_nine = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '10:00' || currHourReading[4][z].currHour === '10:00') {
                hour_ten = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '11:00' || currHourReading[4][z].currHour === '11:00') {
                hour_eleven = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '12:00' || currHourReading[4][z].currHour === '12:00') {
                hour_twelve = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '13:00' || currHourReading[4][z].currHour === '13:00') {
                hour_thirteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '14:00' || currHourReading[4][z].currHour === '14:00') {
                hour_fourteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '15:00' || currHourReading[4][z].currHour === '15:00') {
                hour_fifteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '16:00' || currHourReading[4][z].currHour === '16:00') {
                hour_sixteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '17:00' || currHourReading[4][z].currHour === '17:00') {
                hour_seventeen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '18:00' || currHourReading[4][z].currHour === '18:00') {
                hour_eighteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '19:00' || currHourReading[4][z].currHour === '19:00') {
                hour_nineteen = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '20:00' || currHourReading[4][z].currHour === '20:00') {
                hour_twenty = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '21:00' || currHourReading[4][z].currHour === '21:00') {
                hour_twentyone = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '22:00' || currHourReading[4][z].currHour === '22:00') {
                hour_twentytwo = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '23:00' || currHourReading[4][z].currHour === '23:00') {
                hour_twentythree = currHourReading[4][z].currValue;
            } else if (currHourReading[4][z].currHour === '0:00' || currHourReading[4][z].currHour === '00:00') {
                hour_zero = currHourReading[4][z].currValue;
            }
        }
        let selectReading = `SELECT * FROM hour_readings 
        WHERE hour_readings.date = '${currDate}'
        AND client_id = '${currID}'`;
        db.query(selectReading, (err, result) => {
            if (err) {
                throw err;
            }
            if (result.length != 0) {
                let hasEverything = false;
                // Has everything
                if (result[0].hour_one != -1 && result[0].hour_two != -1 && result[0].hour_three != -1 && result[0].hour_four != -1 && result[0].hour_five != -1 && result[0].hour_six != -1 && result[0].hour_seven != -1 && result[0].hour_eight != -1 && result[0].hour_nine != -1 && result[0].hour_ten != -1 && result[0].hour_eleven != -1 && result[0].hour_twelve != -1 && result[0].hour_thirteen != -1 && result[0].hour_fourteen != -1 && result[0].hour_fifteen != -1 && result[0].hour_sixteen != -1 && result[0].hour_seventeen != -1 && result[0].hour_eighteen != -1 && result[0].hour_nineteen != -1 && result[0].hour_twenty != -1 && result[0].hour_twentyone != -1 && result[0].hour_twentytwo != -1 && result[0].hour_twentythree != -1 && result[0].hour_zero) {
                    hasEverything = true;
                    // let DIFF = 1!!!
                }
                // Has something
                else {
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
                    updateQuery += `WHERE date = '${currDate}' AND client_id = '${currID}' AND type = '${type}' `;
                    if (isChanged) {
                        db.query(updateQuery, (err, result) => {
                            if (err) {
                                throw err;
                            }
                        });
                        console.log(updateQuery);
                    }
                    addToFinalReadings = false;
                }
                // No result found in DB for hour_readings TABLE
            } else {
                addToFinalReadings = true;
            }
        })
        if (addToFinalReadings) {
            filteredHourReading = [currID, currDate, hour_one, hour_two, hour_three, hour_four,
                hour_five, hour_six, hour_seven, hour_eight, hour_nine, hour_ten, hour_eleven,
                hour_twelve, hour_thirteen, hour_fourteen, hour_fifteen, hour_sixteen,
                hour_seventeen, hour_eighteen, hour_nineteen, hour_twenty, hour_twentyone,
                hour_twentytwo, hour_twentythree, hour_zero, type, createdDate
            ]
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
        console.log(results);
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
})

// Connect to DB
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Mysql connected');
});

exports.db = db;