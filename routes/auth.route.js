const AuthController = require('../controllers/auth.controller');
const router         = require('express').Router();
const passport       = require('passport');

router.get('/check/:email', AuthController.checkOverlap);
    
router.post('/register', AuthController.register);

router.post('/login', passport.authenticate('local'), AuthController.login);

router.get('/logout', AuthController.logout);

router.get('/profile', AuthController.profile);

module.exports = router;