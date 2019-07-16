const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const favicon = require("serve-favicon");
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const passportConfig = require('./passport');
const db = require('./config/database');
const authRouter = require('./routes/auth');

const app = express();
app.use(helmet());
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

// Global Vars
app.use((req,res,next) =>  {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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


app.get("/", (req, res) => {
    res.render("layouts/fluid");
});
app.use('/auth', authRouter);

app.get("/sticky", (req, res) => {
    res.render("layouts/sticky-footer");
});

app.get("/marketing-alternate", (req, res) => {
    res.render("layouts/marketing-alternate");
});

app.get("/marketing-narrow", (req, res) => {
    res.render("layouts/marketing-narrow");
});

// catch 404 and forward to error handler
app.use( (req, res, next) => {
    next(createError(404));
});

// error handler
app.use( (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
