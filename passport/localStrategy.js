const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const {User, validateUser} = require('../model/user');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, async (email, password, done) => {
        console.log(email, password);
        try {
            const exUser = await User.findOne({email: email});
            console.log(exUser);
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    return done(null, exUser);
                } else {
                    return done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
                }
            } else {
                return done(null, false, {message: '가입되지 않은 회원입니다.'});
            }
        } catch (error) {
            console.error(error);
            return done(error);
        }
    }));
};