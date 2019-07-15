exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', '로그인 후 이용해주세요.');
        res.redirect('/auth/signin');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
};