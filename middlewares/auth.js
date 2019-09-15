const isLoggedIn = (req, res, next) => {
	if (req.user) {
		return next();
  }
  
  req.flash('message', {'info' : '로그인이 필요한 서비스입니다'});
  return res.redirect('/signin');
};

const isLoggedInforAjax = (req, res, next) => {
	if (req.user) {
		return next();
  }
  
  return res.end('notLoggedIn');
}

const isSameUser = (req, res, next) => {
  if (req.user.id === req.params.userId*1) {
    return next();
  }

  req.flash('message', {'warning' : '유효한 요청이 아닙니다'});
  return res.redirect('/');
}

 module.exports = { isLoggedIn, isLoggedInforAjax, isSameUser };
