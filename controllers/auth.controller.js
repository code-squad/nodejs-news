const jwt       = require('jsonwebtoken');
const User      = require('../models/user');

const AuthController = {};

/*
    GET /auth/check/:email
*/
AuthController.checkOverlap = async (req, res) => {
    try {
        const isExistUser = await User.findOneByEmail(req.params.email);
        const message = (isExistUser) ? "Exist user!" : "Available user!";
        res.json({ message : message });
    } catch (err) {
        res.status(500).send(`An error occurred : ${err}`);
    }
}

/*
    POST /auth/register
    {
        username,
        password,
        nickname
    }
*/
AuthController.register = async (req, res) => {
    try {
        if (await User.findOneByEmail(req.body.email))
            return res.json({ success : false, message : `Exists user!` });

        const user = await User.register(req.body);
        res.json({ success : true, message : `Successfully create new account!`});
    } catch (err) {
        res.status(500).json({ success : false, message : err });
    }
}

/*
    POST /auth/login
    {
        username
        password
    }
*/
AuthController.login = async (req, res) => {
    try {
        res.json({ user : req.user });
    } catch (err) {
        res.status(500).json({ message : `An error occurred : ${err}`});
    }
}

/*
    GET /auth/logout
*/
AuthController.logout = async (req, res) => {
    req.logout();
    res.json({ message : 'Successfully logged out' });
}

/*
    GET /auth/profile
*/
AuthController.profile = async (req, res) => {
    try {
        // const userlist = await User.find({}).exec();
        res.json({ user : req.user });
    } catch (err) {
        res.json({ err : err });
    }
}

module.exports = AuthController;