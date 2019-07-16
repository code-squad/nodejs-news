import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import showdown from 'showdown';
import passport = require('passport');

const articleRouter = Router();
const converter = new showdown.Converter();

articleRouter.get('/:articleid', (req: Request, res: Response, next: NextFunction) => {
  try {

    return res.render('block/article');
  } catch (error) {
    next(createError(404));
  }
});

export default articleRouter;