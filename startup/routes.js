const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const authRouter = require('../routes/auth');
const indexRouter = require('../routes/index');
const articlesRouter = require('../routes/articles');
const {error404, error }= require('../middleware/error');

module.exports = (app) =>{
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(methodOverride('_method'));

    app.use("/", indexRouter);
    app.use('/auth', authRouter);
    app.use('/articles', articlesRouter);
    app.use(error404);
    app.use(error);
};