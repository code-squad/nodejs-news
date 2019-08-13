const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../schemas/user');

const router = express.Router();

router.post('/register', isNotLoggedIn, async (req, res, next) => {
    const { email, password, nickname, userType } = req.body;
    try {
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            req.flash('registerError', '이미 가입된 이메일입니다.');
            return res.redirect('/register');
        }
        const hash = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hash,
            nickname: nickname,
            userType: userType,
        });
        const newUser = await user.save();
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            req.flash('loginError', info.message);
            return res.redirect('/login');
        }
        return req.logIn(user, loginError => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;

