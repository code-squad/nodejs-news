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
    res.status(err.status || 500);
    res.render('error', { title : 'Error', status : err.status, message : err.message });
}

module.exports = errorMiddleware;