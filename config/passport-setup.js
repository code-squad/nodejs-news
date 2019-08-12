const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const googleUser = require('../models/GoogleUser');

dotenv.config();

// session에 정보 전달
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	// console.log('kkk', id);
	googleUser.findById(id).then(user => {
		console.log('useruser', user);
		done(null, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			// options for google strategy
			clientID: process.env.clientID,
			clientSecret: process.env.clientSecret,
			callbackURL: '/auth/google/redirect'
		},
		(accessToken, refreshToken, profile, done) => {
			// check if user already exists in our own db
			googleUser.findOne({ googleId: profile.id }).then(currentUser => {
				if (currentUser) {
					// already have this user
					done(null, currentUser);
				} else {
					// if not, create user in our db
					new googleUser({
						googleId: profile.id,
						username: profile.displayName
					})
						.save()
						.then(newUser => {
							console.log('created new user: ', newUser);
							done(null, newUser);
						});
				}
			});
		}
	)
);
