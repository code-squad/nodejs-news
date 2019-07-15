const GitHubStrategy = require('passport-github').Strategy;
const githubConfig = require('../github-config');
const {User, validateUser} = require('../model/user');


module.exports = (passport) => {
    passport.use(new GitHubStrategy(githubConfig,
        function (accessToken, refreshToken, profile, done) {
            User.findOne({'github.id': profile.id}, async function (err, user) {
                if (err) return done(err);
                if (user) done(null, user);
                else {
                    // if there is no user found with github id, create new one
                    let user = new User();
                    user.github.id = profile.id;
                    user.github.token = accessToken;
                    user.github.name = profile.displayName;
                    if (typeof profile.emails != 'undefined' && profile.emails.length > 0) {
                        user.github.email = profile.emails[0].value;
                    }
                    try {
                        user = await user.save();
                        return done(null, user);
                    } catch (err) {
                        console.error(err);
                        return done(err);
                    }
                }
            });
        }
    ));
};

