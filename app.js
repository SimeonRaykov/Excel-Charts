const express = require('express');
const mysql = require('mysql');
const app = express();

app.listen('3000', () => {
    console.log('Server started on port 3000');
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exceldata'
});

//Create DB
app.get('/createDB', (req, res) => {
    let sql = 'CREATE DATABASE exceldata`';
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('database created');
        console.log(result);
    });
});

//Create Table
app.get('/createposttable', (req, res) => {
    let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('table created');
        console.log(result);
    });
});

//Insert Post 1
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
        console.log(result);
    });
})

//Insert Post 2 
app.get('/addpost2', (req, res) => {
    let post = {
        title: 'Post two',
        body: 'This is post number two'
    };
    let sql = 'INSERT INTO posts SET ?';

    db.query(sql, post, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(`${post} added`);
        console.log(result);
    });
})


//Select posts
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

//Select single post
app.get('/getpost/:id', (req, res) => {
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Post fetched');
        console.log(result);
    });
})


//Update post
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
})

//Delete post
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

//Connect to DB
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Mysql connected');
});