import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';

const homeRouter = Router();

homeRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render('block/article-list', { user: req.user });
  } catch (error) {
    createError(500);
    next(error);
  }
});

export default homeRouter;
