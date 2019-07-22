const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleConfig = require('../config/google-config');
const User = require('../model/user');

module.exports = (passport) => {
    passport.use(new GoogleStrategy(googleConfig,
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await User.findOne({'google.id': profile.id});
                if (user) done(null, user);
                else {
                    // if there is no user found with google id, create new one
                    const image = profile.photos[0].value;

                    let user = new User();
                    user.google.id = profile.id;
                    user.google.email = profile.emails[0].value;
                    user.google.name = profile.name.givenName;
                    user.google.image = image;

                    user = await user.save();
                    if (user) return done(null, user);
                }
            } catch (err) {
                console.error(err);
                return done(err)
            }
        })
    )
};