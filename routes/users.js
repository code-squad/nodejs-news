const express     = require('express'),
      userController  = require('../controller/user-controller'),
      router          = express.Router(),
      auth            = require('../middlewares/auth'),
      upload          = require('../utils/multer-upload');

      require('../auth/passport').setup()

// local 회원가입
router.post('/', userController.addUser);

// Oauth 회원가입
router.post('/auth', upload.array('image', 4), userController.addAuthUser);

// user 정보 업데이트
router.patch('/:userId', auth.isLoggedIn, auth.isSameUser, upload.array('image', 4), userController.updateUser);

// user setting 페이지
router.get('/settings/:userId', auth.isLoggedIn, auth.isSameUser, userController.getSettingsPage);

// 최초 회원가입 후 정보 settings 페이지
router.get('/initSettings', auth.isLoggedIn, userController.getInitSettingsPage);

// '좋아요'를 누른 목록 보기 페이지
router.get('/:username/likes', userController.getLikesPage);

// 회원탈퇴를 위한 user 정보 삭제
router.delete('/:userId', auth.isLoggedIn, auth.isSameUser, userController.deleteUser);

module.exports = router;