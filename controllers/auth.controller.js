const User      = require('../models/user');
const jwt       = require('jsonwebtoken');
const passport  = require('passport');

const AuthController = {};

/*
    GET /auth/check-overlap/:username
*/
AuthController.checkOverlap = async (req, res) => {
    try {
        const isExistUser = await User.findOne({ username : req.params.username }).exec();
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
        password
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

        User.register(newUser, req.body.password, (err, user) => {
            const message = (err) ? `${err}` : `Successfully created new account`;
            res.json({ message : message, user });
        });
    } catch (err) {
        res.status(500).json({ message : `An error occurred : ${err}`});
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

module.exports = AuthController;