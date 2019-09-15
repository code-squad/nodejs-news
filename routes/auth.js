const express = require('express'),
      router = express.Router(),
      authController = require('../controller/auth-controller'),
      userController = require('../controller/user-controller');

// local-login
router.post('/local-login', authController.localLogin);

router.get('/google-login', authController.googleLogin);

router.get('/google-login/callback', authController.googleLoginCallback);

router.get('/google-register', authController.googleRegister);

// Oauth 회원가입 신청 후 init settings에서 필요한 정보 기입 후 회원가입 완료
router.get('/google-register/callback', authController.googleRegisterCallback, userController.getInitSettingsPage);

router.post('/logout', authController.logout);

router.get('/resetpassword', authController.resetPassword);

router.get('/resetpassword', (req, res, next) => {
  authController.resetPassword(req, res, next);
})

module.exports = router;