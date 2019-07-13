// module
const express       = require('express'),
      app           = express(),
      createError   = require('http-errors'),
      path          = require('path'),
      cookieParser  = require('cookie-parser'),
      logger        = require('morgan'),
      bodyParser    = require('body-parser'),
      mongoose      = require('mongoose'),
      session       = require('express-session');

// routes
const indexRouter   = require('./routes/index'),
      loginRouter   = require('./routes/login'),
      usersRouter   = require('./routes/users')

// DB
mongoose.Promise = global.Promise;
let url = process.env.DATABASE_URL || "mongodb://localhost:27017/test";
mongoose.connect(url, { useNewUrlParser: true })
.then(() => console.log('Successfully connected to mongodb'))
.catch(e => console.error(e));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}))
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
