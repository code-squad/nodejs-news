const express       = require('express');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const path          = require('path');

const passport      = require('passport');
const JwtStrategy   = require('passport-jwt').Strategy;
const ExtractJwt    = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const config        = require('./config');
const User          = require('./models/user');
const authRouter    = require('./routes/auth.route');
const indexRouter   = require('./routes/index.route');

/* ==========================
    EXPRESS CONFIGURATION
============================= */
const app = express();
const port = process.env.PORT || 7777;

const jwtOptions = { 
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(), 
    secretOrKey : config.secret 
};

app.locals.pretty = true;

app.set('jwt-secret', config.secret);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
    User.findOne({ username : payload.username }, (err, user) => {
        if (err)  return done(err, false);
        if (user) return done(null, user);
        return done(null, false);
    });
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.listen(port, () => console.log(`Application server is running on port [ ${port} ]`))

/* ==============================
    CONNECT TO MONGODB
================================= */
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => console.log(`Mongodb server is connected`));

mongoose.connect(config.mongodbUri, { useNewUrlParser : true, useCreateIndex : true });