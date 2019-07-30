const morgan = require('morgan');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwtParser = require('./middlewares/jwt-parser')
const app = express();
const port = process.env.PORT || 3000;
 
require('./db-connect')();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(jwtParser());
const passport = require('./src/passport')(app);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', require('./routes/auth')(passport));

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send(err.message);
});

app.listen(port, () => {
    console.log(`runnning at ${port}`);
});