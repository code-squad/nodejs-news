const AuthController = require('../controllers/auth.controller');
const router         = require('express').Router();
const passport       = require('passport');

const options = { failureRedirect : '/login', failureFlash : true };

router.get('/check/:email', AuthController.checkOverlap);

router.post('/register', AuthController.register);

router.post('/login', passport.authenticate('local', options), AuthController.login);

router.get('/logout', AuthController.logout);

module.exports = router;