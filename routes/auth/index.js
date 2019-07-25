const router = require('express').Router();
const authController = require('./auth-controller');

module.exports = (passport) => {
    router.post('/register', authController.register);
    router.post('/login', authController.authenticate(passport));
    router.get('/logout', authController.logout);

    return router;
}