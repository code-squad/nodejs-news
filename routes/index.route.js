const IndexController = require('../controllers/index.controller');
const router          = require('express').Router();

router.get('/', IndexController.index);

router.get('/index', IndexController.index);

module.exports = router;