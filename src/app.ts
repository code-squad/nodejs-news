import flash from 'connect-flash';
import mongo from 'connect-mongo';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import createError from 'http-errors';
import logger from 'morgan';
import passport from 'passport';
import path from 'path';
import { passportConfig } from './config/passport';
import connect from './connect';
import articleRouter from './routes/article';
import authRouter from './routes/auth';
import homeRouter from './routes/home';
import uploadRouter from './routes/upload';
import userRouter from './routes/user';
import { addHours } from './util/datehelper';
import { MONGODB_URI, SESSION_SECRET } from './util/secrets';


const MongoStore = mongo(session);
const mongoUrl = MONGODB_URI;

connect({db: mongoUrl});
passportConfig(passport);

const app = express();

app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  req.session.cookie.expires = addHours(24);
  req.session.cookie.maxAge = 3600000 * 24;
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../src/public')));

// Set flashMessage
app.use((req, res, next) => {
  res.locals.flashMessage = req.flash('flashMessage');
  next();
});

app.use('/', homeRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/article', articleRouter);
app.use('/upload', uploadRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', {
    env: req.app.get('env'),
    errorMessage: err.message,
    stackTrace: err.stack,
    statusCode: err.status,
  });
});

export default app;
