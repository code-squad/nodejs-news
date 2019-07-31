import bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import JWT from 'jsonwebtoken';
import passport from 'passport';
import authController from '../controllers/auth';
import userController from '../controllers/user';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth';
<<<<<<< HEAD
import { IUser } from '../models/user.model';
import { issueToken, removeToken } from '../util/jwt';
||||||| merged common ancestors
=======
import { IUser } from '../models/user.model';
import { JWT_SECRET } from '../util/secrets';
>>>>>>> refactor: Local 로그인 인증 방식 변경

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
      return res.send({message: '이미 가입된 이메일입니다.'});
    }
    const hash = await bcrypt.hash(password, 12);
    await userController.CreateUser({
      email,
      password: hash,
      provider: 'local',
    });
    return res.redirect('/');
  } catch (error) {
    next(createError(409));
  }
});

authRouter.post('/signin', isNotLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (authError, user: IUser, info) => {
    if (authError) {
      return next(authError);
    }
    if (info) {
      return res.send(info);
    }
<<<<<<< HEAD

    issueToken(res, user);
    return res.redirect(req.headers.referer);
||||||| merged common ancestors
    return req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      } else {
        return res.redirect('/');
      }
    });
=======
    const token = JWT.sign({
      id: user.id,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      privilege: user.privilege,
    }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 });
    return res.redirect(req.headers.referer);
>>>>>>> refactor: Local 로그인 인증 방식 변경
  })(req, res, next);
});

authRouter.post('/signout', isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
  try {
<<<<<<< HEAD
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

    let existUser = await userController.GetUserByEmail(userInfo.data.email);

    if (!existUser) {
      existUser = await userController.CreateUser({
        email: userInfo.data.email,
        provider: 'google',
        profileImageUrl: userInfo.data.picture,
      });
    }

    issueToken(res, existUser);
    return res.redirect('/');
  } catch (error) {
    next(error);
||||||| merged common ancestors
    let destroyResult;
    req.logout();
    req.session.destroy(err => destroyResult = err);

    if (destroyResult) {
      throw destroyResult;
    }

    return res.redirect('/');
  } catch (err) {
    next(err);
=======
    res.cookie('token', '', { maxAge: 0 });
    return res.redirect(req.headers.referer);
  } catch (err) {
    next(err);
>>>>>>> refactor: Local 로그인 인증 방식 변경
  }
});

export default authRouter;
