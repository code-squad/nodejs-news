import bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import passport from 'passport';
import userController from '../controllers/user';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth';

const authRouter = Router();

authRouter.get('/signup', isNotLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render('signup');
  } catch (error) {
    next(createError(500));
  }
});

authRouter.post('/signup', isNotLoggedIn,  async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    const exUser = await userController.GetUserByEmail(email);
    if (exUser) {
      req.flash('signupError', '이미 ');
      return res.send({message: '이미 가입된 이메일입니다.'});
    }
    const hash = await bcrypt.hash(password, 12);
    await userController.CreateUser({ email, password: hash});
    return res.redirect('/');
  } catch (error) {
    next(createError(409));
  }
});

authRouter.post('/signin', isNotLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      return next(authError);
    }
    if (info) {
      return res.send(info);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next);
});

authRouter.post('/signout', isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
  try {
    let destroyResult;
    req.logout();
    req.session.destroy(err => destroyResult = err);

    if (destroyResult) {
      throw destroyResult;
    }

    return res.redirect('/');
  } catch (err) {
    next(err);
  }
});

export default authRouter;
