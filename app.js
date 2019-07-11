var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require("serve-favicon");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, "public", "ico", "favicon.ico")));

app.use(function(req, res, next) {
  app.locals.pretty = true;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res) {
  res.render("default");
});

app.get("/fluid", function(req, res) {
  res.render("layouts/fluid");
});

app.get("/signin", function(req, res) {
  res.render("layouts/signin");
});

app.get("/signup", function(req, res) {
  res.render("layouts/signup");
});

app.get("/sticky", function(req, res) {
  res.render("layouts/sticky-footer");
});

app.get("/marketing-alternate", function(req, res) {
  res.render("layouts/marketing-alternate");
});

app.get("/marketing-narrow", function(req, res) {
  res.render("layouts/marketing-narrow");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
