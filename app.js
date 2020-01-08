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
})

// Get clients
app.post('/getClient', (req, res) => {
    console.log(req.body.join());
    let sql = `SELECT * FROM clients WHERE ident_code IN (${req.body.join()})`;
    db.query(sql, req.body.join(), (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Clients get');
        return res.send(JSON.stringify(result));
    });
})

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