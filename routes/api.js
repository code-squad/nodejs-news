const express = require('express'),
      router = express.Router(),
      apiController = require('../controller/api-controller')
      authMiddlewares = require('../middlewares/auth'),

router.post('/forgotpassword', apiController.sendPasswordCheckEmail);

router.patch('/resetpassword', apiController.resetPassword);

router.patch('/follow/:userId', authMiddlewares.isLoggedInforAjax, apiController.updateFollowStatus);

module.exports = router;