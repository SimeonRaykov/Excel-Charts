const mysql = require('mysql');
const mysqlSync = require('sync-mysql');
const fs = require('fs');

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

let connection;

function handleDisconnect() {
    connection = db // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) { // The server is either down
        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            fs.writeFile('error_log.txt', err, function (err) {
                //    if (err) throw err;
                // console.log('Saved!');
            });
            setTimeout(handleDisconnect, 10000); // We introduce a delay before attempting to reconnect,
        } // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        handleDisconnect();
        /*     if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                handleDisconnect(); // lost due to either server restart, or a
            } else { // connnection idle timeout (the wait_timeout
                throw err; // server variable configures this)
            } */
    });
}

handleDisconnect();

exports.db = db;
exports.dbSync = dbSync;