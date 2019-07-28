require('dotenv').config();
// require('express-async-errors'); // async middleware 대시 이걸 사용해도 된다. (이 모듈을 사용하는 게 더 간편하지만 공부 목적을 위해 직접 async middleware 를 만들어 사용했다.
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const favicon = require("serve-favicon");
const passport = require('passport');
const passportConfig = require('./passport');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const articlesRouter = require('./routes/articles');
const {error404, error }= require('./middleware/error');
const app = express();

app.use(helmet());

// require('./startup/routes')(app);

process.on('uncaughtException', (ex) => {
    console.log('We got an uncaught exception');
    winston.error(ex.message, ex);
});

winston.configure({transports: [new winston.transports.File({ filename: 'logfile.log'})]});
require('./startup/db')();
require('./startup/passport')(app);

app.use(flash());

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
app.use(error404);
app.use(error);

module.exports = app;
