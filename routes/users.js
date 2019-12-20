const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const app = require('../app.js');
const passport = require('../config/passport');

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

// Register handler
router.post('/register', (req, res) => {
    const {
        email,
        password,
        password2
    } = req.body;

    let errors = [];

    // Check required fields
    if (!email || !password || !password2) {
        errors.push({
            msg: 'Please fill in all fields'
        });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({
            msg: 'Passwords do not match'
        });
    }

    // Check passlength
    if (password.length < 6) {
        errors.push({
            msg: 'Password should be at least 6 characters'
        });
    }
    if (errors.length > 0) {
        res.render('register.ejs', {
            errors,
            email,
            password,
            password2
        });

    } else {
        // Check if User exists
        let sql = `SELECT * FROM exceldata.users WHERE name='${email}'`;
        app.db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            if (result.length > 0) {
                req.flash('error_msg','Username already exists');
              // errors.push({msg:'Username already exists'});
                res.redirect('register');
            } else {

                // Register User
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        let sqlRegister = `INSERT INTO users SET name='${email}', password='${hash}';`;
                        app.db.query(sqlRegister, (err, results) => {
                            if (err) {
                                throw err;
                            }
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('login');
                        })
                    }))
            }
        })
    }
});


// Login handler
router.post('login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRequest: '/users/login',
        failureFlash: true
    })(req, res, next);
});


// Logout handler
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are now logged out');
    res.redirect('/users/login');
})

module.exports = router;