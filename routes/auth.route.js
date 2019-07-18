const AuthController = require('../controllers/auth.controller');
const router         = require('express').Router();

router.get('/check/:username', AuthController.checkOverlap);

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.get('/logout', AuthController.logout);

router.get('/profile', AuthController.profile);

module.exports = router;