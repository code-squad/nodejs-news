const passport  = require('passport');
const jwt       = require('jsonwebtoken');
const User      = require('../models/user');

const AuthController = {};

/*
    GET /auth/check/:username
*/
AuthController.checkOverlap = async (req, res) => {
    try {
        const isExistUser = await User.findByUsername(req.params.username).exec();
        const message = (isExistUser) ? "Exist username" : "Available username";
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
        const userCount = await User.countDocuments({}).exec();

        const newUser = new User({
            username    : req.body.username,
            nickname    : req.body.nickname,
            admin       : (!userCount) ? true : false
        });

        User.register(newUser, req.body.password, (err) => {
            if (err) return res.status(500).json({ success : false, message : err });
            res.json({ success : true, message : `Successfully create new account!` });
        });
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
        const { username, password } = req.body;

        if (!username || !password) 
            return res.status(400).json({ message : 'Please enter your info (username or password)' });

        passport.authenticate('local', { session : false }, (err, user, info) => {
            const error = err || info;

            if (error) 
                return res.status(401).json({ error : error });

            if (!user) 
                return res.status(404).json({ message : 'Not exist user' });
            
            const payload = { username : user.username };
            const options = { expiresIn : '7d', issuer: 'hyodol.com' };
            res.json({ access_token : jwt.sign(payload, req.app.get('jwt-secret'), options) });
        })(req, res);
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
        res.json({ user : req.user });
    } catch (err) {
        res.json({ err : err });
    }
}

module.exports = AuthController;