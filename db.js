const mysql = require('mysql');
const mysqlSync = require('sync-mysql');

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
});

exports.db = db;
exports.dbSync = dbSync;