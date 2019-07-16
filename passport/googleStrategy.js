const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleConfig = require('../config/google-config');
const {User, validateUser} = require('../model/user');

module.exports = (passport) => {
    passport.use(new GoogleStrategy(googleConfig,
        async (accessToken, refreshToken, profile, done) => {
            try {
                // if there is no user found with google id, create new one
                const user = await User.findOne({'google.id': profile.id});
                if (user) done(null, user);
                else {
                    const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));

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