const path          = require('path');
const morgan        = require('morgan');
const express       = require('express');
const mongoose      = require('mongoose');
const cookieParser  = require('cookie-parser');
const flash         = require('connect-flash');
const bodyParser    = require('body-parser');
const session       = require('express-session');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const config            = require('./config');
// Model
const User              = require('./models/user');
// Routers
const indexRouter       = require('./routes/index.route');
const authRouter        = require('./routes/auth.route');
const userRouter        = require('./routes/user.route');
// Middleware
const authMiddleware    = require('./middlewares/auth.middleware');
const errorMiddleware   = require('./middlewares/error.middleware');

/* ==============================
    CONNECT TO MONGODB
================================= */
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => console.log(`Mongodb server is connected`));

mongoose.connect(config.mongodbUri, { useNewUrlParser : true, useCreateIndex : true });

/* ==========================
    EXPRESS CONFIGURATION
============================= */
const app    = express();
const port   = process.env.PORT || 7777;

// views
app.locals.pretty = true;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// etc
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

// Session-related
app.use(session({ 
    secret              : 'seCRetOFhyODol', 
    resave              : false, 
    saveUninitialized   : true 
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// local passport
const localOptions = { usernameField : 'email', passwordField : 'password' };
passport.use(new LocalStrategy(localOptions, async (userEmail, password, done) => {
    const user = await User.findOneByEmail(userEmail);

    if (!user) 
        return done(null, false, { message : `Incorrect your email` });

    if (!await user.verify(password))
        return done(null, false, { message : `Incorrect your password` });

    return done(null, user);
}));
passport.serializeUser((user, done) => {
    done(null, { 
        email    : user.email, 
        nickname : user.nickname, 
        admin    : user.admin,
    });
});
passport.deserializeUser((user, done) => done(null, user));

// router
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', authMiddleware);
app.use('/user', userRouter);

// error
app.use(errorMiddleware.error404);
app.use(errorMiddleware.error);

app.listen(port, () => console.log(`Application server is running on port [ ${port} ]`))