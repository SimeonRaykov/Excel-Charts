const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load user model 

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {

            // Match user
            bcrypt.compare(user.password, (err, isMatch) => {
                if (error) throw err;
                if (isMatch) {
                    return done(null, User);
                } else {
                    return done(null, false, {
                        message: 'Incorrect user/password'
                    });
                }
            })

        })
    )
}