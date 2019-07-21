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
        if (await User.findOneByEmail(req.body.email))
            return res.json({ success : false, message : `Exists user!` });

        if (!await User.register(req.body))
            return res.status(500).json({ success : false, message : `Failure`});
            
        res.json({ success : true, message : `Successfully create new account!`});
    } catch (err) {
        res.status(500).json({ success : false, message : err });
    }
}

AuthController.logout = async (req, res) => {
    req.logout();
    res.json({ message : 'Successfully logged out' });
}

module.exports = AuthController;