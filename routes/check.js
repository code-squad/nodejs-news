const express         = require('express'),
      router          = express.Router(),
      checkController = require('../controller/check-controller');

router.get('/username/:username', checkController.checkDupleUsername);

router.get('/useremail/:email', checkController.checkDupleEmail);

module.exports = router;
