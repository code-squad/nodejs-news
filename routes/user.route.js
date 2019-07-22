const UserController = require('../controllers/user.controller');
const router         = require('express').Router();

// Test
router.get('/', UserController.test);

module.exports = router;