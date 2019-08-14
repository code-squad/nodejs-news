const flash = require('connect-flash');

module.exports = (app) => {

    app.use(flash());

    // Global Vars for flash message and user info
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
    });
};
