const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../utils/db/user');
const pool = require('../db/connect-mysql').pool;
require('dotenv').config()

exports.setup = () => {
  // local 로그인
  passport.use('local-login', new LocalStrategy({
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
    }, async (usernameOrEmail, password, done) => {
      try {

        const [rows] =  await pool.query(`SELECT * FROM USERS WHERE username = "${usernameOrEmail}" or email = "${usernameOrEmail}"`);
        
        // db에 유저 정보가 있으면 userInfo에 유저 정보 할당
        let userInfo = false;
        if (rows.length > 0 ) {
          userInfo = rows[0];
        }

        // validation check : 해당 아이디가 없는 경우
        if (!userInfo) {
          return done(null, false, {message : {'warning' : 'invaild username or password'}});
        }

        // validation check : 해당 패스워드가 일치하지 않는 경우
        if (!await User.isValidPassword(password, userInfo.PASSWORD)) {
          return done(null, false, {message : {'warning' : 'invaild username or password'}});
        }

        const user = User.makeUserObj(userInfo.ID, userInfo.USERNAME, userInfo.PHOTO_LINK);
        return done(null, user, {message : {'success' : `${user.username} 님, 환영합니다!`}});
      
      } catch (error) {
        return done(error);
      }
    }
    )),
    
    // local 회원가입
    passport.use('signup', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback: true
    }, async (req, email, password, done) => {
      
      try {
        // username 중복 검사
        const checkDupleUsernameInfo = await pool.query(
          `
          SELECT
          COUNT(*) dupleUsernameCount
          FROM
          USERS
          WHERE
          username = "${req.body.username}"
          `)
          
        const [dupleUsername] = checkDupleUsernameInfo;
        const {dupleUsernameCount} = dupleUsername[0];

        if (dupleUsernameCount > 0) {
          return done(null, false, { message : {'warning' : '동일한 유저 네임이 존재합니다.'}});
        }
        
        // email 중복 검사
        const checkDupleEmailInfo = await pool.query(
          `
          SELECT
          COUNT(*) dupleEmailCount
          FROM
          USERS
          WHERE
          email = "${email}"
          `)
          
          const [dupleEmail] = checkDupleEmailInfo;
          const {dupleEmailCount} = dupleEmail[0];
          
          if (dupleEmailCount > 0) {
            return done(null, false, { message : {'warning' : '동일한 이메일 주소가 존재합니다.'}} );
          }
          
          password = await User.getCryptoPassword(password);

          const [result] = await pool.query(
            `
          INSERT INTO USERS
          (username, email, password)
          VALUES
          ("${req.body.username}", "${email}", "${password}");
          `
          )
          
          if (result.affectedRows === 1 && result.serverStatus === 2) {
            const user = User.makeUserObj(result.insertId, req.body.username, "/images/profile_dummy.png");
            return done(null, user, {message : { 'success' :  `환영합니다, ${user.username} 님!`}});
          }

        } catch (error) {
          done(error);
        }
      }))
      
    }
