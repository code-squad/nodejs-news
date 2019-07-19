const IndexController = {};

/*
    GET /
    GET /index
*/
IndexController.index = async (req, res) => {
    res.render('index', { _title : `Today's News - Main` });
}

/*
    GET /signUp
*/
IndexController.signUp = async (req, res) => {
    res.render('signUp', { _title : `Today's News - Sign Up` });
}

module.exports = IndexController;