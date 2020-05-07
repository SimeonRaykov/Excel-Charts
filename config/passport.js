const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const app = require('../app');

// Load user model 

module.exports = function (passport) {
    passport.use(new LocalStrategy(({
        usernameField: 'email',
        passwordField: 'password'
    }), (email, password, done) => {
        // Match user
        let checkIfUserExistsSQL = `SELECT * FROM users WHERE name='${email}';`;
        app.db.query(checkIfUserExistsSQL, (err, result) => {
            if (err) {
                throw err;
            }
            if (result.length === 0) {
                return done(null, false, {
                    message: 'Username/Password incorrect'
                });
            } else {
                let userPassSQLhashed = `SELECT * FROM users WHERE name='${email}';`;
                app.db.query(userPassSQLhashed, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    let hashed = result[0].password;
                    bcrypt.compare(password, hashed, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, result[0]);
                        } else {
                            return done(null, false, {
                                message: 'Username/Password incorrect'
                            });
                        }
                    });
                });
            }
        });
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        app.db.query("SELECT * FROM users WHERE id = " + id, function (err, rows) {
            done(err, rows[0]);
        });
    });

}