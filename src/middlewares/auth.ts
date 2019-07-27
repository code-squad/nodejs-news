import { NextFunction, Request, Response } from 'express';

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('flashMessage', '로그인이 필요한 요청입니다.');
    res.redirect('/');
  }
};

export const isNotLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};
