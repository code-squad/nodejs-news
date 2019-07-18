const AuthController = require('../controllers/auth.controller');
const router         = require('express').Router();

router.get('/check-overlap/:username', (req, res) => AuthController.checkOverlap(req, res));
router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));

module.exports = router;