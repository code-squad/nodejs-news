const winston = require('winston');
const createError = require('http-errors');

// catch 404 and forward to error handler
const error404 = ( (req, res, next) => {
    next(createError(404));
});
// error handler
const error = ( (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    winston.error(err.message, err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = {
    error404,
    error
};