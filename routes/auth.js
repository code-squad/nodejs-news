const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {User, validateUser} = require('../model/user');

const router = express.Router();

// github login
router.get("/github-login", passport.authenticate('github'));
router.get("/github/callback", passport.authenticate('github', {
    successRedirect: '/',
    successFlash   : 'Welcome!',
    failureRedirect: '/auth/signin',
    failureFlash   : true
}));

// google login
router.get("/google-login", passport.authenticate('google', {scope: ['profile', 'email']}));
router.get("/google/callback", passport.authenticate('google', {
    successRedirect: '/',
    successFlash   : 'Welcome!',
    failureRedirect: '/auth/signin',
    failureFlash   : true
}));

router.get("/signin", isNotLoggedIn, function (req, res) {
    res.render("layouts/signin");
});

router.get("/signup", isNotLoggedIn, function (req, res) {
    res.render("layouts/signup");
});

router.post('/signup', isNotLoggedIn, async (req, res, next) => {
    const {email, name, password, password2} = req.body;
    if (!email || !name || !password || !password2) {
        req.flash('error_msg', '모든 필드에 정보를 입력해주세요');
        return res.redirect("signup");
    }
    if (password !== password2) {
        req.flash('error_msg', '비밀번호가 일치하지 않습니다.');
        return res.redirect("signup");
    }

    if (password.length < 6) {
        req.flash('error_msg', '비밀번호는 최소 6글자 이상어야 합니다.');
        return res.redirect("signup");
    }

    try {
        const exUser = await User.findOne({email: email});
        if (exUser) {
            req.flash('signUpError', '이미 가입된 이메일입니다.');
            return res.render("layouts/signup", {signUpError: req.flash('signUpError')});
        } else {
            const hash = await bcrypt.hash(password, 12);
            let user = new User({
                email   : email,
                name    : name,
                password: hash,
            });
            user = await user.save();
            if (user) {
                req.flash('success_msg', '회원가입이 완료되었습니다. 로그인 해주세요 :)');
                return res.redirect('signin');
            }
        }

    } catch (error) {
        console.error(error);
        return next(error);
    }
});


router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: 'signin',
        failureFlash   : true
    })(req, res, next);
});


// 로그 아웃
router.get('/logout', isLoggedIn, function (req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/signin');
});


module.exports = router;