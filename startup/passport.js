const passport = require('passport');
const passportConfig = require('../passport');
const session = require('express-session');

module.exports = (app) => {
    passportConfig(passport);
    // ----- Passport config ----
    app.use(session({
        secret           : 'sony news!',
        resave           : false,
        saveUninitialized: true,
    }));
    app.use(passport.initialize());
    app.use(passport.session());
// ------ passport config ------
};
