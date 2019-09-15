const express         = require('express'),
      router          = express.Router(),
      profileController = require('../controller/profile-controller');

router.get('/:username', profileController.home);

module.exports = router;
