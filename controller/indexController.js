const indexController = {
  home: (req, res) => {
    res.render('main', {
      title: 'Daily Frame | The creators Network',
      user: req.user
    });
  },

  signin: (req, res) => {
    res.render('signin', {
      title: 'Sign in | Daily Frame',
    });
  },

  signup: (req, res) => {
    res.render('signup', {
      title: 'Sign up | Daily Frame'
    });
  },

  forgotpassword: (req, res) => {
    res.render('forgotpassword', {
      title: 'Forgot Password | Daily Frame'
    });
  }
}

module.exports = indexController;