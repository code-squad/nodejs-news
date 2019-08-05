import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { RequestS3 } from '../config/multer';
import { googleAuthUrl } from '../config/oauth';
import articleController from '../controllers/article';
import { checkArticleOwner } from '../middlewares/article';
import { isLoggedIn } from '../middlewares/auth';
import { articleUploadMiddleware, heroImageUploadMiddleware, markdownUploadMiddleware } from '../middlewares/upload';
import logger from '../util/logger';

const articleRouter = Router();

articleRouter.get('/:articleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.articleId;
    const articleInfo = await articleController.getRawArticleById(articleId);

    let likedArticle = true;

    if (req.user) {
      likedArticle = await articleController.checkLikeArticle({articleId, likeUserId: req.user.id});
    }

    return res.render('block/article', {
      user: req.user,
      article: articleInfo.article,
      rawHtml: articleInfo.rawHtml,
      writer: articleInfo.writer,
      googleAuthUrl,
      likedArticle,
    });
  } catch (error) {
    next(createError(500));
  }
});

articleRouter.post('/', isLoggedIn, articleUploadMiddleware,
  async (req: RequestS3, res: Response, next: NextFunction) => {
    try {
      await articleController.createArticle({
        writerId: req.user._id,
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
    const articles = await articleController.getArticlesByUserId(req.user._id, page, 20);

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
    await articleController.patchArticleById({_id: req.params.id, title: req.body.title});

    return res.send();
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.patch('/:id/markdown', isLoggedIn, checkArticleOwner, markdownUploadMiddleware,
  async (req: RequestS3, res: Response, next: NextFunction) => {
    try {
      await articleController.patchArticleById({ _id: req.params.id, markdownKey: req.file.key });
      return res.send();
    } catch (error) {
      createError(500);
      next(error);
    }
});

articleRouter.patch('/:id/heroimage', isLoggedIn, checkArticleOwner, heroImageUploadMiddleware,
  async (req: RequestS3, res: Response, next: NextFunction) => {
    try {
      await articleController.patchArticleById({ _id: req.params.id, heroImageUrl: req.file.location });
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

export default articleRouter;