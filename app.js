const express = require('express');
const mySql = require('mysql');
const app = express();

app.listen('3000', () => {
    console.log('Server started on port 3000');
});


let connection = mysql.createConnection({
    host: 'localhost',
    user 
})