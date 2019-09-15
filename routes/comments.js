const express         = require('express'),
      router          = express.Router(),
      commentsController = require('../controller/comments-controller'),
      authMiddlewares = require('../middlewares/auth');

router.post('/', authMiddlewares.isLoggedInforAjax, commentsController.addComment);

router.delete('/:postId/:commentId', commentsController.removeComment);

router.patch('/:commentId', commentsController.updateComment);

module.exports = router;