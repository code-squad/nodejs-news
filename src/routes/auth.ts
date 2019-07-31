import bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import JWT from 'jsonwebtoken';
import passport from 'passport';
import userController from '../controllers/user';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth';
import { IUser } from '../models/user.model';
import { JWT_SECRET } from '../util/secrets';

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
    await userController.CreateUser({ email, password: hash});
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
  })(req, res, next);
});

authRouter.post('/signout', isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('token', '', { maxAge: 0 });
    return res.redirect(req.headers.referer);
  } catch (err) {
    next(err);
  }
});

export default authRouter;
