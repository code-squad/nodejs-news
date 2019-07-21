const AuthController = require('../controllers/auth.controller');
const router         = require('express').Router();
const passport       = require('passport');

router.get('/check/:email', AuthController.checkOverlap);

router.post('/register', AuthController.register);

router.post('/login', passport.authenticate('local', { 
    successRedirect : '/', 
    failureRedirect : '/login', 
    failureFlash    : true
}));

router.get('/logout', AuthController.logout);

module.exports = router;