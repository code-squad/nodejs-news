const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('main', {
        user: req.user,
    });
});

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('login', {
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

router.get('/register', isNotLoggedIn, (req, res) => {
    res.render('register', {
        user: req.user,
        registerError: req.flash('regisgerError'),
    });
});

module.exports = router;