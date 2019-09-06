import bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import passport from 'passport';
import authController from '../controllers/auth';
import userController from '../controllers/user';
import { User } from '../entity/user.entity';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth';
import { issueToken, removeToken } from '../util/jwt';

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
    const exUser = await userController.getUserByEmail(email);
    if (exUser) {
      return res.send({message: '이미 가입된 이메일입니다.'});
    }
    const hash = await bcrypt.hash(password, 12);
    await userController.createUser({
      email,
      password: hash,
      provider: 'local',
    });
    return res.redirect('/');
  } catch (error) {
    console.log(error.message);
    next(createError(409));
  }
});

authRouter.post('/signin', isNotLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (authError, user: User, info) => {
    if (authError) {
      return next(authError);
    }
    if (info) {
      return res.send(info);
    }

    issueToken(res, user);
    return res.redirect(req.headers.referer);
  })(req, res, next);
});

authRouter.post('/signout', isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
  try {
    removeToken(res);
    return res.redirect(req.headers.referer);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/google/callback', isNotLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationCode = req.query.code;
    const userInfo = await authController.getGoogleUserInfo(authorizationCode);

    let existUser = await userController.getUserByEmail(userInfo.data.email);

    if (!existUser) {
      existUser = await userController.createUser({
        email: userInfo.data.email,
        provider: 'google',
        profileImageUrl: userInfo.data.picture,
      });
    }

    issueToken(res, existUser);
    return res.redirect('/');
  } catch (error) {
    next(error);
  }
});

export default authRouter;
