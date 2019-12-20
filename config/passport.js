const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const app = require('../app');

// Load user model 

module.exports = function (passport) {

    passport.use(
        new LocalStrategy(function (email, password, done) {

            // Match user
            let checkIfUserExistsSQL = `SELECT * FROM exceldata.users WHERE name='${email}';`;
            app.db.query(checkIfUserExistsSQL, (err, result) => {
                console.log(result);
                if (err) {
                    throw err;
                }
                if (result.length === 0) {
                    return done(null, false, {
                        message: 'Username/Password incorrect'
                    });
                } else {

                    let userPassSQLhashed = `SELECT password FROM users WHERE name='${email}';`;
                    app.db.query(userPassSQLhashed, (err, result) => {
                        if (err) {
                            throw err;
                        }
                        let hashed = result[0].password;
                        bcrypt.compare(password, hashed, (err, isMatch) => {
                            if (err) throw err;
                            if (isMatch) {
                                console.log(1);
                                return done(null, user);
                            } else {
                                return done(null, false, {
                                    message: 'Username/Password incorrect'
                                });
                            }
                        });
                    });
                }
            });
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

}