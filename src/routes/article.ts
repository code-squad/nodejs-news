import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { RequestS3 } from '../config/multer';
import { googleAuthUrl } from '../config/oauth';
import articleController from '../controllers/article';
import commentController from '../controllers/comment';
import { Article } from '../entity/article.entity';
import { checkArticleOwner, checkCommentOwner } from '../middlewares/article';
import { isLoggedIn } from '../middlewares/auth';
import { articleUploadMiddleware, heroImageUploadMiddleware, markdownUploadMiddleware } from '../middlewares/upload';
import logger from '../util/logger';

const articleRouter = Router();

articleRouter.get('/:articleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.articleId;
    const article: Article = await articleController.getArticleById(articleId, true);

    let likedArticle = true;

    if (req.user) {
      likedArticle = await articleController.checkLikeArticle({articleId, likeUserId: req.user.id});
    }

    const rawMarkdown = await articleController.getMarkdown(article.markdownKey);

    const commentCount = await commentController.getCommentCountOfArticle(articleId);

    return res.render('block/article', {
      user: req.user,
      article,
      rawHtml: articleController.convertMarkdownToHtml(rawMarkdown),
      writer: article.writer,
      googleAuthUrl,
      likedArticle,
      commentCount,
    });
  } catch (error) {
    console.log(error.message);
    next(createError(500));
  }
});

articleRouter.post('/', isLoggedIn, articleUploadMiddleware,
  async (req: RequestS3, res: Response, next: NextFunction) => {
    try {
      await articleController.createArticle({
        writerId: req.user.id,
        title: req.body.title,
        // tslint:disable-next-line: no-string-literal
        markdownKey: req.files['markdown'][0].key,
        // tslint:disable-next-line: no-string-literal
        heroImageUrl: req.files['heroimage'][0].location,
      });

      return res.redirect(req.headers.referer);
    } catch (error) {
      createError(500);
      logger.error(error);
      req.flash('flashMessage', '업로드 도중 서버에서 문제가 발생했습니다.');
      res.redirect(req.headers.referer);
    }
});

articleRouter.get('/user/:userId/page/:page', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, page } = req.params;
    const articles = await articleController.getArticlesByUserId(userId, parseInt(page, 10));

    return res.render('components/userpage/article-list', { user: req.user, articles });
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.get('/page/:page', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await articleController.getArticles(parseInt(req.params.page, 10));

    return res.render('components/index-list', { user: req.user, articles });
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.get('/manage/:page', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.params.page, 10);
    const articles = await articleController.getArticlesByUserId(req.user.id, page, 20);

    return res.render('block/manage', { user: req.user, articles, page });
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleController.deleteArticle(req.params.id);

    return res.send();
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.patch('/:id/title', isLoggedIn, checkArticleOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleController.patchArticleById({ id: req.params.id, title: req.body.title });

    return res.send();
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.patch('/:id/markdown', isLoggedIn, checkArticleOwner, markdownUploadMiddleware,
  async (req: RequestS3, res: Response, next: NextFunction) => {
    try {
      await articleController.patchArticleById({ id: req.params.id, markdownKey: req.file.key });
      return res.send();
    } catch (error) {
      createError(500);
      next(error);
    }
});

articleRouter.patch('/:id/heroimage', isLoggedIn, checkArticleOwner, heroImageUploadMiddleware,
  async (req: RequestS3, res: Response, next: NextFunction) => {
    try {
      await articleController.patchArticleById({ id: req.params.id, heroImageUrl: req.file.location });
      return res.send();
    } catch (error) {
      createError(500);
      next(error);
    }
});

articleRouter.post('/likes/:id', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleController.likeArticle({articleId: req.params.id, likeUserId: req.user.id});
    res.send();
  } catch (error) {
    logger.error(`Fail to update like of article ${req.params.id}
    Error Message: ${error.message}
    Stacktrace: ${error.stack}`);
    res.status(500).send({message: '좋아요 처리에 실패했습니다.'});
  }
});

articleRouter.delete('/likes/:id', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleController.retractLikeArticle({articleId: req.params.id, likeUserId: req.user.id});
    res.send();
  } catch (error) {
    logger.error(`Fail to remove like of article ${req.params.id}
    Error Message: ${error.message}
    Stacktrace: ${error.stack}`);
    res.status(500).send({message: '좋아요 취소 처리에 실패했습니다.'});
  }
});

articleRouter.get('/:id/comments/show', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.id,
    page = req.query.page ? parseInt(req.query.page, 10) : 1,
    userId = req.user ? req.user.id : undefined;
    const article = await articleController.getArticleById(articleId);
    const comments = await commentController.getComments({articleId, userId, page});
    const commentCount = await commentController.getCommentCountOfArticle(articleId);

    return res.render('block/comment', {
      user: req.user,
      googleAuthUrl,
      article,
      comments,
      commentCount,
    });
  } catch (error) {
    next(error);
  }
});

articleRouter.get('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.id,
    page = req.query.page ? parseInt(req.query.page, 10) : 1,
    userId = req.user ? req.user.id : undefined;
    const comments = await commentController.getComments({articleId, userId, page});

    return res.render('components/comment/comment-card', {
      comments,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({message: '댓글 조회에 실패했습니다.'});
  }
});

articleRouter.post('/:id/comments', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.id, writerId = req.user.id;
    await commentController.createComment({articleId, writerId, ...req.body });

    res.redirect(req.headers.referer);
  } catch (error) {
    next(error);
  }
});

articleRouter.delete('/:articleId/comments/:commentId', isLoggedIn, checkCommentOwner,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      await commentController.removeComment(commentId);

      res.send();
    } catch (error) {
      logger.error(`Error message: ${error.message}\nStacktrace: ${error.stack}`);
      res.status(500).send({message: '댓글 삭제 도중 에러가 발생했습니다. 잠시 후 다시 시도해주세요.'});
    }
  });

articleRouter.post('/:articleId/comments/:commentId/like', isLoggedIn,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      await commentController.likeComment({ commentId, userId: req.user.id });

      res.send();
    } catch (error) {
      logger.error(`Error message: ${error.message}\nStacktrace: ${error.stack}`);
      res.status(500).send({message: '요청 처리 중 에러가 발생했습니다.'});
    }
  });

articleRouter.delete('/:articleId/comments/:commentId/like', isLoggedIn,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      await commentController.retractLikeComment({ commentId, userId: req.user.id });

      res.send();
    } catch (error) {
      logger.error(`Error message: ${error.message}\nStacktrace: ${error.stack}`);
      res.status(500).send({message: '요청 처리 중 에러가 발생했습니다.'});
    }
  });

export default articleRouter;