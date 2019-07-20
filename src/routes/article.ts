import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import articleController from '../controllers/article';

const articleRouter = Router();

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

export default articleRouter;