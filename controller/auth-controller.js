const passport = require('passport');
const generateJWTToken = require('../utils/jwt-token-generator');
const googleAuthApi = require('../auth/googleapis');
const userHandler = require('../utils/db/user');
const jwt = require('jsonwebtoken')
const pool = require('../db/connect-mysql').pool;

require('dotenv').config()
require('../auth/passport').setup()

const authController = {
  localLogin: (req, res, next) => {
    passport.authenticate('local-login', {
      session : false
    }, async (err, user, info) => {
      try {

        if (err) {
          return next(err);
        }

        if (!user) {
          req.flash('message', info.message)
          return res.redirect('/signin');
        }

        req.login(user, { session: false }, async (error) => {

          await generateJWTToken(res, user);
          req.flash('message', info.message)
          return res.redirect('/');

        });

      } catch (error) {
        return next(error);
      }
    })(req, res, next)
  },

  googleLogin : (req, res, next) => {
    return res.redirect(googleAuthApi.url)
  },

  googleRegister : (req, res, next) => {
    return res.redirect(googleAuthApi.registerUrl);
  },

  googleRegisterCallback : async (req, res, next) => {
    
    try {
      const code = req.query.code;
      const {tokens} = await googleAuthApi.oauth2ClientForRegister.getToken(code);
      googleAuthApi.oauth2ClientForRegister.setCredentials(tokens);
  
      const plus = googleAuthApi.getGooglePlusApi(googleAuthApi.oauth2ClientForRegister);
      const me = await plus.people.get({ userId: 'me' });
      const email = me.data.emails[0].value;
      const profilePhoto = me.data.image.url;

      const [rows] =  await pool.query(`SELECT * FROM USERS WHERE auth_google_id = "${email}"`);

      if (rows.length > 0) {
        req.flash('message', {'info' : '이미 google 회원가입이 되어 있습니다!'});
        res.redirect('/signin');
        return;
      }

      const user = {
        "authGoogleId" : email,
        "photolink" : profilePhoto,
      }

      req.user = user;
      next();

    } catch (error) {
      next(error);
    }
  },

  googleLoginCallback : async (req, res, next) => {

    try {
      const code = req.query.code;
      const {tokens} = await googleAuthApi.oauth2Client.getToken(code);
      googleAuthApi.oauth2Client.setCredentials(tokens);
  
      const plus = googleAuthApi.getGooglePlusApi(googleAuthApi.oauth2Client);
      const me = await plus.people.get({ userId: 'me' });
      const email = me.data.emails && me.data.emails.length && me.data.emails[0].value;
      
      const [rows] =  await pool.query(`SELECT * FROM USERS WHERE auth_google_id = "${email}" and validation = "Y"`);
  
      if (rows.length < 1) {
        req.flash('message', {'info' : '아직 회원가입을 하지 않으셨군요?'});
        res.redirect('/signup');
        return;
      }
  
      const userInfo = rows[0];
      const user = userHandler.makeUserObj(userInfo.ID, userInfo.USERNAME, userInfo.PHOTO_LINK);
      await generateJWTToken(res, user);
      res.redirect('/')

    } catch (error) {
      next(error);      
    }
  },

  logout : (req, res, next) => {
    res.clearCookie('token', { path: '/' })
    return res.redirect('/');
  },

  resetPassword : (req, res, next) => {
    const token = req.query.token;
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken.address) {
      req.flash('message', {'error' : '올바르지 않은 접근 경로입니다'});
      return res.redirect('/');
    }

    res.render('resetpassword', {
      title: 'Reset password | Daily Frame',
      email: decodedToken.address,
      token: token
    });
  }
}

module.exports = authController;