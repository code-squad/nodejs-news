require('dotenv').config();
// require('express-async-errors'); // async middleware 대시 이걸 사용해도 된다. (이 모듈을 사용하는 게 더 간편하지만 공부 목적을 위해 직접 async middleware 를 만들어 사용했다.
const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const favicon = require("serve-favicon");
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const passportConfig = require('./passport');
const methodOverride = require('method-override');
const db = require('./config/database');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const articlesRouter = require('./routes/articles');
const app = express();

process.on('uncaughtException', (ex) => {
    console.log('We got an uncaught exception');
    winston.error(ex.message, ex);
});

app.use(helmet());
winston.configure({transports: [new winston.transports.File({ filename: 'logfile.log'})]});
passportConfig(passport);

mongoose.connect(db.mongoURI, {useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'));

// ----- Passport config ----
app.use(session({
    secret           : 'sony news!',
    resave           : false,
    saveUninitialized: true,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// ------ passport config ------

// Global Vars for flash message and user info
app.use((req,res,next) =>  {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug', {defaultEngine: 'main'});

app.use(favicon(path.join(__dirname, "public", "ico", "favicon.ico")));

app.use( (req, res, next) => {
    app.locals.pretty = true;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));

app.use("/", indexRouter);
app.use('/auth', authRouter);
app.use('/articles', articlesRouter);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
    next(createError(404));
});

// error handler
app.use( (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    winston.error(err.message, err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
