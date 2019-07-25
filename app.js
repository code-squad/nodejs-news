const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('./configs/config')
const dbConfig = require('./configs/db-config');
const port = process.env.PORT || 3000;

const db = require('./db-connect')(dbConfig);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: config.secret,
    store: new MongoStore({ mongooseConnection: db })
}));

const passport = require('./src/passport')(app);                                    
app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', require('./routes/auth')(passport));

app.listen(port, () => {
    console.log(`runnning at ${port}`);
});