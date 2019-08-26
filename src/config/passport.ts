import { Request } from 'express';
import { PassportStatic } from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import { getConnection } from 'typeorm';
import { User } from '../entity/user.entity';
import { JWT_SECRET } from '../util/secrets';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const JWTOptions = {
  jwtFromRequest: (req: Request) => req ? req.cookies.token : undefined,
  secretOrKey: JWT_SECRET,
};

export const passportConfig = (passport: PassportStatic) => {
  // 최초 로그인할 때 실행
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .where('email = :email', { email, })
      .andWhere('deletedAt is null')
      .getOne()
      .then((user: User) => {
        if (!user) {
          return done(undefined, false, { message: '일치하는 정보가 없습니다.' });
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
          if (err) { return done(err); }
          if (isMatch) { return done(undefined, user); }
          return done(undefined, false, { message: '일치하는 정보가 없습니다.'});
        });
      })
      .catch(err => {
        return done(err);
      });
  }));

  // 매 요청마다 실행
  passport.use(new JWTStrategy(JWTOptions, (jwtPayload, done) => {
    getConnection()
    .getRepository(User)
    .createQueryBuilder('user')
    .where('email = :email', { email: jwtPayload.email })
    .andWhere('deletedAt is null')
    .getOne()
    .then((user: User) => {
      if (!user) {
        return done(undefined, false, { message: '일치하는 정보가 없습니다.' });
      }
      return done(undefined, user);
    })
    .catch(err => {
      return done(err);
    });
  }));
};
