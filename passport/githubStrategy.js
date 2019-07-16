const GitHubStrategy = require('passport-github').Strategy;
const githubConfig = require('../config/github-config');
const {User, validateUser} = require('../model/user');

module.exports = (passport) => {
    passport.use(new GitHubStrategy(githubConfig,
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await User.findOne({'github.id': profile.id});
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

