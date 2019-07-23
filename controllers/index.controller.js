const IndexController = {};

IndexController.index = async (req, res) => {
    const data = { title : `Main` };
    
    if (req.user) 
        data.user = req.user;

    res.render('index', data);
}

IndexController.signUp = async (req, res) => {
    res.render('signUp', { title : `Sign Up`, message : req.flash('message') });
}

IndexController.login = async (req, res) => {
    const flashMessage = req.flash();
    const data = { title : `Login` };

    if (flashMessage.error)
        data.message = flashMessage.error[0];

    res.render('login', data);
}

module.exports = IndexController;