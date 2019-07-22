const errorMiddleware = {};

errorMiddleware.error404 = async (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
}

errorMiddleware.error = async (err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render error page
    err.status(err.status || 500);
    res.render('error');
}

module.exports = errorMiddleware;