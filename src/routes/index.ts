import { Request, Response, Router } from 'express';
import createError from 'http-errors';

const homeRouter = Router();

homeRouter.get('/', async (req: Request, res: Response, next) => {
  try {
    return res.render('index', { user: req.user });
  } catch (error) {
    createError(500);
    next(error);
  }
});

export default homeRouter;
