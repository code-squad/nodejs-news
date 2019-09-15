const express         = require('express'),
      router          = express.Router(),
      contentController = require('../controller/content-controller'),
      upload          = require('../utils/multer-upload'),
      authMiddlewares = require('../middlewares/auth'),
      contentsMiddlewares = require('../middlewares/content')

router.get('/:contentNumber', contentController.getContentPage);

router.delete('/:contentNumber', authMiddlewares.isLoggedIn, contentsMiddlewares.isAuthor, contentController.deleteContent);

router.patch('/:contentNumber', authMiddlewares.isLoggedIn, contentsMiddlewares.isAuthor, upload.array('image', 4), contentController.updateContent);

router.patch('/meta/:contentNumber/like', authMiddlewares.isLoggedInforAjax, contentController.updateLike);

module.exports = router;