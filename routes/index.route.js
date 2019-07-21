const IndexController = require('../controllers/index.controller');
const router          = require('express').Router();

router.get('/', IndexController.index);

router.get('/index', IndexController.index);

router.get('/signUp', IndexController.signUp);

router.get('/login', IndexController.login);

module.exports = router;