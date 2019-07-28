require('dotenv').config();
// require('express-async-errors'); // async middleware 대시 이걸 사용해도 된다. (이 모듈을 사용하는 게 더 간편하지만 공부 목적을 위해 직접 async middleware 를 만들어 사용했다.
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const favicon = require("serve-favicon");
const app = express();
app.use(helmet());

process.on('uncaughtException', (ex) => {
    console.log('We got an uncaught exception');
    console.error(ex.message, ex);
});

require('./startup/db')();
require('./startup/passport')(app);
require('./startup/flash')(app);

// require('./startup/view')(app);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug', {defaultEngine: 'main'});
app.use(favicon(path.join(__dirname, "public", "ico", "favicon.ico")));
app.use(express.static(path.join(__dirname, 'public')));

require('./startup/routes')(app);



module.exports = app;
