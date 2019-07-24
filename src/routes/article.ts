import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { markdownUpload } from '../config/multer';
import articleController from '../controllers/article';
import { isLoggedIn } from '../middlewares/auth';
import logger from '../util/logger';

const articleRouter = Router();

function markdownUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  markdownUpload.fields([
    { name: 'markdown', maxCount: 1 },
    { name: 'heroimage', maxCount: 1},
  ])(req, res, err => {
    if (err) {
      createError(500);
      req.flash('flashMessage', '마크다운 업로드에 실패했습니다. 파일 크기(1MB 미만)나 네트워크 회선을 점검해주세요.');
      return res.redirect(req.headers.referer);
    } else {
      next();
    }
  });
}

articleRouter.get('/:articleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = req.params.articleId;

    const article = await articleController.getRawArticleById(articleId);

    return res.render('block/article', { user: req.user, article });
  } catch (error) {
    console.error(error);
    next(createError(500));
  }
});

articleRouter.post('/', isLoggedIn,  markdownUploadMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleController.createArticle({
      writerId: req.user._id,
      title: req.body.title,
      // tslint:disable-next-line: no-string-literal
      markdownKey: req.files['markdown'][0].key,
      // tslint:disable-next-line: no-string-literal
      heroImageUrl: req.files['heroimage'][0].location
    });

    return res.redirect(req.headers.referer);
  } catch (error) {
    createError(500);
    logger.error(error);
    req.flash('flashMessage', '업로드 도중 서버에서 문제가 발생했습니다.');
    res.redirect(req.headers.referer);
  }
});

articleRouter.get('/userid/:userId/page/:page', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, page } = req.params;
    const articles = await articleController.getArticlesByUserId(userId, parseInt(page, 10));

    return res.send(articles);
    // return res.render('user-articles', { user: req.user, articles });
  } catch (error) {
    createError(500);
    next(error);
  }
});

articleRouter.get('/page/:page', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await articleController.getArticles(parseInt(req.params.page, 10));

    // return res.send(articles);
    return res.render('components/index-list', { user: req.user, articles});
  } catch (error) {
    createError(500);
    next(error);
  }
});

export default articleRouter;