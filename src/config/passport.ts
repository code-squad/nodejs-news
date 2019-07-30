import { NextFunction, Request, Response } from 'express';
import { PassportStatic } from 'passport';
import passportLocal from 'passport-local';
import User from '../models/user.model';


const LocalStrategy = passportLocal.Strategy;

export const passportConfig = (passport: PassportStatic) => {
  passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, ('-password'), (err, user) => {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
      if (err) { return done(err); }
      if (!user) {
        return done(undefined, false, { message: '일치하는 정보가 없습니다.' });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) { return done(err); }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, { message: '일차하는 정보가 없습니다.' });
      });
    });
  }));
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
