import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { IS3Request, markdownUpload } from '../config/multer';
import articleController from '../controllers/article';
import { isLoggedIn } from '../middlewares/auth';
import logger from '../util/logger';

const articleRouter = Router();

function markdownUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  markdownUpload.single('markdown')(req, res, err => {
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

articleRouter.post('/', isLoggedIn,  markdownUploadMiddleware, async (req: IS3Request, res: Response, next: NextFunction) => {
  try {
    await articleController.createArticle({
      writerId: req.user._id,
      title: req.body.title,
      markdownKey: req.file.key,
    });
    return res.redirect(req.headers.referer);
  } catch (error) {
    createError(500);
    logger.error(error);
    req.flash('flashMessage', '업로드 도중 서버에서 문제가 발생했습니다.');
    res.redirect(req.headers.referer);
  }
});


export default articleRouter;