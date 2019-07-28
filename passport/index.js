const local = require('./localStrategy');
const github = require('./githubStrategy');
const google = require('./googleStrategy');
const User = require('../model/user');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local(passport);
    github(passport);
    google(passport);
};