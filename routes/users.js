const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

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
        console.log(1);
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
    console.log(errors);
    if (errors.length > 0) {
        res.render('register.ejs', {
            errors,
            email,
            password,
            password2
        });

    } else {

        /*   bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err,hash)=>{
if(err) throw err; 
password = hash;

saveUserToDB();

    });
        })
         Validation passed

            if(UserExists) Send res.render register.ejs 
               else  {new User, encrypt pass, insert into table}
*/

    }
});

module.exports = router;