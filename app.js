const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const favicon = require("serve-favicon");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
// const passportCongif = require('./passport');
const GitHubStrategy = require('passport-github').Strategy;
const githubConfig = require('./github-config');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
app.use(helmet());


//   ----- Passport config ----
app.use(session({
    secret           : 'sony news!',
    resave           : false,
    saveUninitialized: true,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GitHubStrategy(githubConfig,
    function (accessToken, refreshToken, profile, cb) {
        // User.findOrCreate({ githubId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
        cb(null, profile);
    }
));
passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user)
});
// ------ passport config ------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, "public", "ico", "favicon.ico")));

app.use(function (req, res, next) {
    app.locals.pretty = true;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.render("default");
});

app.get("/fluid", function (req, res) {
    console.log(req.user);
    res.render("layouts/fluid");
});

app.get("/signin", function (req, res) {
    res.render("layouts/signin");
});

// github login
app.get("/github-login", passport.authenticate('github'));

app.get("/auth/github/callback", passport.authenticate('github', {
    successRedirect: '/fluid',
    successFlash: 'Welcome!',
    failureRedirect: '/signin',
    failureFlash: true
}));

app.get("/signup", function (req, res) {
    res.render("layouts/signup");
});

app.get("/sticky", function (req, res) {
    res.render("layouts/sticky-footer");
});



app.get("/marketing-alternate", function (req, res) {
    res.render("layouts/marketing-alternate");
});

app.get("/marketing-narrow", function (req, res) {
    res.render("layouts/marketing-narrow");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
