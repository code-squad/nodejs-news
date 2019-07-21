const jwt       = require('jsonwebtoken');
const User      = require('../models/user');

const AuthController = {};

AuthController.checkOverlap = async (req, res) => {
    try {
        const isExistUser = await User.findOneByEmail(req.params.email);
        const message = (isExistUser) ? "Exist user!" : "Available user!";
        res.json({ message : message });
    } catch (err) {
        res.status(500).send(`An error occurred : ${err}`);
    }
}

AuthController.register = async (req, res) => {
    try {
        let message = undefined;
        if (await User.findOneByEmail(req.body.email))
            message = 'Exists user information';
        
        if (!await User.register(req.body))
            message = 'Failure register'
        
        if (message) {
            req.flash('message', message);
            return res.redirect('/signUp');
        }

        res.redirect('/');
    } catch (err) {
        req.flash('message', 'Server Error');
        res.redirect('/signUp');
    }
}

AuthController.login = async (req, res) => {
    res.redirect(req.session.cookie.path);
}

AuthController.logout = async (req, res) => {
    req.logout();
    res.redirect(req.session.cookie.path);
}

module.exports = AuthController;